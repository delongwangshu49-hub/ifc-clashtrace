"""Analyze the selected VG background track for beat-synchronous editing.

Outputs the audit artifacts required by video-shotcraft's music-beat-sync
workflow. Times remain floating-point seconds; frame conversion belongs in the
later Remotion implementation.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import librosa
import numpy as np
from scipy.signal import butter, find_peaks, sosfilt


def band_env(y: np.ndarray, sr: int, lo: float, hi: float) -> tuple[np.ndarray, np.ndarray]:
    sos = butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    env = librosa.onset.onset_strength(y=sosfilt(sos, y), sr=sr)
    return env, librosa.times_like(env, sr=sr)


def nearest_errors(grid: np.ndarray, onsets: np.ndarray) -> np.ndarray:
    indexes = np.searchsorted(onsets, grid)
    indexes = np.clip(indexes, 1, len(onsets) - 1)
    left = onsets[indexes - 1]
    right = onsets[indexes]
    nearest = np.where(np.abs(grid - left) <= np.abs(right - grid), left, right)
    return nearest - grid


def candidate_metrics(
    name: str,
    interval: float,
    phase: float,
    start: float,
    end: float,
    onsets: np.ndarray,
) -> dict[str, float | str | int | bool]:
    start_index = int(np.ceil((start - phase) / interval))
    grid = phase + np.arange(start_index, int(np.floor((end - phase) / interval)) + 1) * interval
    grid = grid[(grid >= start) & (grid <= end)]
    usable_onsets = onsets[(onsets >= start - 0.1) & (onsets <= end + 0.1)]
    errors = nearest_errors(grid, usable_onsets)
    absolute = np.abs(errors)
    matched = absolute <= 0.033
    slope = float(np.polyfit(grid, errors, 1)[0]) if len(grid) > 1 else 0.0
    return {
        "candidate": name,
        "bpm": round(60.0 / interval, 6),
        "interval_seconds": round(interval, 9),
        "phase_seconds": round(phase, 9),
        "grid_points": int(len(grid)),
        "match_percent_33ms": round(float(np.mean(absolute <= 0.033) * 100.0), 3),
        "match_percent_50ms": round(float(np.mean(absolute <= 0.050) * 100.0), 3),
        "mean_abs_ms": round(float(np.mean(absolute) * 1000.0), 3),
        "matched_mean_abs_ms": round(float(np.mean(absolute[matched]) * 1000.0), 3),
        "unmatched_count_33ms": int(np.sum(~matched)),
        "p90_abs_ms": round(float(np.percentile(absolute, 90) * 1000.0), 3),
        "max_abs_ms": round(float(np.max(absolute) * 1000.0), 3),
        "estimated_segment_drift_ms": round(abs(slope) * (end - start) * 1000.0, 3),
        "first_grid_attack_within_50ms": bool(absolute[0] <= 0.050),
    }


def local_peaks(env: np.ndarray, times: np.ndarray, label: str) -> list[dict[str, float | str]]:
    threshold = float(np.percentile(env, 85))
    peaks, _ = find_peaks(env, height=threshold, distance=2)
    if len(peaks) == 0:
        return []
    strengths = env[peaks]
    normalizer = float(np.max(strengths)) or 1.0
    return [
        {
            "t": round(float(times[index]), 6),
            "s": round(float(env[index] / normalizer), 6),
            "k": label,
        }
        for index in peaks
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--analysis-start", type=float, default=0.0)
    parser.add_argument("--analysis-end", type=float)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    y, sr = librosa.load(args.input, sr=None, mono=True)
    duration = float(librosa.get_duration(y=y, sr=sr))
    analysis_start = max(0.0, args.analysis_start)
    analysis_end = min(duration, args.analysis_end if args.analysis_end is not None else duration)
    if analysis_end <= analysis_start:
        raise ValueError("analysis end must be greater than analysis start")
    _, percussive = librosa.effects.hpss(y)

    _, beat_times = librosa.beat.beat_track(
        y=percussive,
        sr=sr,
        tightness=400,
        units="time",
    )
    if len(beat_times) < 16:
        raise RuntimeError(f"Insufficient detected beats: {len(beat_times)}")

    indexes = np.arange(len(beat_times))
    matrix = np.vstack([indexes, np.ones_like(indexes)]).T
    (base_interval, raw_base_phase), *_ = np.linalg.lstsq(matrix, beat_times, rcond=None)
    fitted = raw_base_phase + indexes * base_interval
    residuals = beat_times - fitted
    base_phase = float(raw_base_phase % base_interval)

    onset_env = librosa.onset.onset_strength(y=percussive, sr=sr)
    onset_times = librosa.onset.onset_detect(
        onset_envelope=onset_env,
        sr=sr,
        units="time",
        backtrack=False,
    )

    candidates = [
        candidate_metrics("half", base_interval * 2.0, base_phase, analysis_start, analysis_end, onset_times),
        candidate_metrics("base", base_interval, base_phase, analysis_start, analysis_end, onset_times),
        candidate_metrics("double", base_interval / 2.0, base_phase, analysis_start, analysis_end, onset_times),
    ]
    winner = max(
        candidates,
        key=lambda item: (
            item["estimated_segment_drift_ms"] <= 5.0,
            item["match_percent_33ms"],
            -item["matched_mean_abs_ms"],
            -item["estimated_segment_drift_ms"],
        ),
    )
    interval = float(winner["interval_seconds"])
    phase = float(winner["phase_seconds"])
    beat_start = int(np.ceil((analysis_start - phase) / interval))
    beats = phase + np.arange(beat_start, int(np.floor((analysis_end - phase) / interval)) + 1) * interval
    beats = beats[(beats >= analysis_start) & (beats <= analysis_end)]

    kick_env, band_times = band_env(percussive, sr, 40, 160)
    snare_body_env, _ = band_env(percussive, sr, 150, 500)
    snare_snap_env, _ = band_env(percussive, sr, 1000, 3000)
    snare_env = np.sqrt(np.maximum(snare_body_env, 0.0) * np.maximum(snare_snap_env, 0.0))
    hihat_env, _ = band_env(percussive, sr, 6000, min(14000, sr / 2 - 100))

    hits = (
        local_peaks(kick_env, band_times, "kick")
        + local_peaks(snare_env, band_times, "snare")
        + local_peaks(hihat_env, band_times, "hihat")
    )
    hits.sort(key=lambda item: float(item["t"]))

    rms = librosa.feature.rms(y=y)[0]
    rms_times = librosa.times_like(rms, sr=sr)
    normalized_rms = rms / (float(np.max(rms)) or 1.0)
    section_seconds = 8.0 * interval
    sections: list[dict[str, float | int | str]] = []
    section_start = max(0.0, float(beats[0]))
    section_index = 0
    while section_start < duration:
        section_end = min(duration, section_start + section_seconds)
        mask = (rms_times >= section_start) & (rms_times < section_end)
        mean_energy = float(np.mean(normalized_rms[mask])) if np.any(mask) else 0.0
        if mean_energy < 0.24:
            level = "low"
        elif mean_energy < 0.48:
            level = "medium"
        else:
            level = "high"
        sections.append(
            {
                "index": section_index,
                "start": round(section_start, 6),
                "end": round(section_end, 6),
                "mean_rms": round(mean_energy, 6),
                "energy": level,
            }
        )
        section_start = section_end
        section_index += 1

    kick_hits = [item for item in hits if item["k"] == "kick"]
    strongest_kicks = sorted(kick_hits, key=lambda item: float(item["s"]), reverse=True)[:12]
    strongest_kicks.sort(key=lambda item: float(item["t"]))

    trim_relative_t0 = float(beats[0] - analysis_start)
    strict_pass = bool(
        float(winner["match_percent_33ms"]) >= 98.0
        and float(winner["matched_mean_abs_ms"]) <= 10.0
        and float(winner["estimated_segment_drift_ms"]) <= 5.0
    )

    beat_data = {
        "source": args.input.as_posix(),
        "sample_rate": sr,
        "duration_seconds": round(duration, 6),
        "analysis_segment": {
            "start": round(analysis_start, 6),
            "end": round(analysis_end, 6),
            "duration": round(analysis_end - analysis_start, 6),
        },
        "bpm": round(60.0 / interval, 6),
        "t0": round(trim_relative_t0, 9),
        "T": round(interval, 9),
        "timeline_contract": {
            "source_time_reference": "absolute seconds in the untrimmed source file",
            "source_grid_phase_seconds": round(phase, 9),
            "audio_trim_start_seconds": round(analysis_start, 6),
            "trim_relative_t0_seconds": round(trim_relative_t0, 9),
            "beat_interval_seconds": round(interval, 9),
            "beats_array_reference": "absolute source seconds",
            "remotion_seconds_formula": "trim_relative_t0_seconds + beat_index * beat_interval_seconds",
        },
        "beat_track_fit": {
            "detected_beats": int(len(beat_times)),
            "base_bpm": round(60.0 / float(base_interval), 6),
            "max_abs_residual_ms": round(float(np.max(np.abs(residuals))) * 1000.0, 3),
            "mean_abs_residual_ms": round(float(np.mean(np.abs(residuals))) * 1000.0, 3),
        },
        "beats": [round(float(value), 6) for value in beats],
        "hits": hits,
        "strongest_kicks": strongest_kicks,
        "rms": [
            {"t": round(float(time), 6), "v": round(float(value), 6)}
            for time, value in zip(rms_times[::8], normalized_rms[::8])
        ],
        "sections": sections,
    }
    drift_data = {
        "source": args.input.as_posix(),
        "candidates": candidates,
        "winner": winner["candidate"],
        "winner_strict_pass": strict_pass,
        "winner_reason": "Candidates first pass the <=5 ms segment-drift gate, then rank by 33 ms transient coverage and matched-point mean error.",
        "strict_skill_thresholds": {
            "match_percent": 98.0,
            "matched_mean_abs_ms": 10.0,
            "segment_drift_ms": 5.0,
        },
    }

    if not strict_pass:
        raise RuntimeError(
            "Selected beat grid failed strict coverage, matched-error, or drift thresholds: "
            + json.dumps(winner, ensure_ascii=False)
        )

    (args.output / "beat_data.json").write_text(
        json.dumps(beat_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (args.output / "grid_drift.json").write_text(
        json.dumps(drift_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        json.dumps(
            {
                "duration_seconds": beat_data["duration_seconds"],
                "analysis_segment": beat_data["analysis_segment"],
                "bpm": beat_data["bpm"],
                "t0": beat_data["t0"],
                "T": beat_data["T"],
                "beat_track_fit": beat_data["beat_track_fit"],
                "winner": drift_data["winner"],
                "candidates": drift_data["candidates"],
                "strongest_kicks": beat_data["strongest_kicks"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
