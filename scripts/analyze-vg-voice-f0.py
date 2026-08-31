#!/usr/bin/env python3
"""Estimate audition pitch ranges for the VG voice-gender mismatch audit.

This signal check does not infer anyone's gender identity. It only helps catch a
synthetic audition that acoustically falls far outside the requested female
voice direction; the user's listening judgement remains authoritative.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import soundfile as sf


ROOT = Path(__file__).resolve().parents[1]
AUDITIONS = ROOT / "artifacts" / "vg-auditions"
OUTPUT = ROOT / "artifacts" / "vg" / "analysis" / "voice_f0.json"

FILES = {
    "H": "V2-zero-cost-kokoro-af_heart-pcm16.wav",
    "C_REJECTED_MALE": "V2-zero-cost-chatterbox-default-male-rejected.wav",
    "D": "V2-zero-cost-parler-laura-female.wav",
}


def estimate(path: Path) -> dict[str, float | int | str]:
    audio, sample_rate = sf.read(path, always_2d=False)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    audio = audio.astype(np.float64)
    frame_size = round(sample_rate * 0.04)
    hop = round(sample_rate * 0.01)
    min_lag = max(1, round(sample_rate / 350))
    max_lag = round(sample_rate / 70)
    window = np.hanning(frame_size)
    frames: list[np.ndarray] = []
    rms_values: list[float] = []
    for start in range(0, max(0, len(audio) - frame_size), hop):
        frame = audio[start : start + frame_size]
        frames.append(frame)
        rms_values.append(float(np.sqrt(np.mean(frame * frame))))
    threshold = max(float(np.percentile(rms_values, 35)), 1e-4)
    pitches: list[float] = []
    for frame, rms in zip(frames, rms_values):
        if rms < threshold:
            continue
        frame = (frame - frame.mean()) * window
        correlation = np.correlate(frame, frame, mode="full")[frame_size - 1 :]
        if correlation[0] <= 0:
            continue
        lag = min_lag + int(np.argmax(correlation[min_lag : max_lag + 1]))
        if correlation[lag] / correlation[0] >= 0.28:
            pitches.append(sample_rate / lag)
    values = np.array(pitches)
    return {
        "file": path.name,
        "sample_rate_hz": int(sample_rate),
        "duration_seconds": round(len(audio) / sample_rate, 3),
        "median_f0_hz": round(float(np.median(values)), 1),
        "p25_f0_hz": round(float(np.percentile(values, 25)), 1),
        "p75_f0_hz": round(float(np.percentile(values, 75)), 1),
        "accepted_voiced_frames": int(len(values)),
    }


def main() -> None:
    result = {
        "purpose": "VG synthetic-voice acoustic mismatch check; user listening remains authoritative",
        "method": "40 ms Hann-windowed autocorrelation, 10 ms hop, 70-350 Hz search, correlation >= 0.28",
        "auditions": {key: estimate(AUDITIONS / filename) for key, filename in FILES.items()},
        "decision": "C rejected as male; H and D remain female-voice finalists",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
