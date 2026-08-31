#!/usr/bin/env python3
"""Generate deterministic, original VG-only SFX palette auditions.

The previews are deliberately sparse and are not final G7A sound design.
They contain, in order: a UI click, a transition whoosh, a result impact,
and a short settle tone.
"""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path


SAMPLE_RATE = 48_000
DURATION = 6.2
TAU = math.tau
OUT = Path(__file__).resolve().parents[1] / "artifacts" / "vg-auditions" / "sfx"


def envelope(t: float, start: float, attack: float, decay: float) -> float:
    if t < start or t >= start + attack + decay:
        return 0.0
    x = t - start
    if x < attack:
        return math.sin((x / attack) * math.pi / 2) ** 2
    return math.exp(-6.0 * (x - attack) / decay)


def pan(value: float, position: float) -> tuple[float, float]:
    angle = (position + 1.0) * math.pi / 4
    return value * math.cos(angle), value * math.sin(angle)


def render_palette(name: str, style: int) -> Path:
    rng = random.Random(8_300 + style)
    count = int(SAMPLE_RATE * DURATION)
    left = [0.0] * count
    right = [0.0] * count
    lp = 0.0
    hp_state = 0.0

    for i in range(count):
        t = i / SAMPLE_RATE
        sample_l = 0.0
        sample_r = 0.0

        # 0.45 s — click / consent tick.
        if style == 1:
            click = envelope(t, 0.45, 0.002, 0.045)
            value = click * (0.46 * math.sin(TAU * 1_180 * (t - 0.45)) + 0.14 * (rng.random() * 2 - 1))
        elif style == 2:
            click = envelope(t, 0.45, 0.003, 0.15)
            value = click * (0.30 * math.sin(TAU * 1_568 * (t - 0.45)) + 0.16 * math.sin(TAU * 2_352 * (t - 0.45)))
        else:
            click = envelope(t, 0.45, 0.004, 0.08)
            value = click * (0.28 * math.sin(TAU * 720 * (t - 0.45)) + 0.10 * (rng.random() * 2 - 1))
        pl, pr = pan(value, -0.08)
        sample_l += pl
        sample_r += pr

        # 1.55–2.55 s — filtered-noise transition whoosh.
        noise = rng.random() * 2 - 1
        cutoff = 0.025 + 0.18 * max(0.0, min(1.0, (t - 1.55) / 1.0))
        lp += cutoff * (noise - lp)
        hp_state += 0.015 * (lp - hp_state)
        band = lp - hp_state
        whoosh_env = envelope(t, 1.55, 0.50 if style != 3 else 0.68, 0.55 if style != 3 else 0.78)
        whoosh_gain = (0.34, 0.28, 0.43)[style - 1]
        whoosh = band * whoosh_env * whoosh_gain
        position = max(-1.0, min(1.0, -0.8 + 1.6 * (t - 1.55)))
        pl, pr = pan(whoosh, position)
        sample_l += pl
        sample_r += pr

        # 4.05 s — result impact, kept below narration-safe audition level.
        x = t - 4.05
        if x >= 0:
            impact_env = math.exp(-5.2 * x) if x < 1.0 else 0.0
            freq = (105.0, 88.0, 58.0)[style - 1]
            body = math.sin(TAU * freq * x + 0.7 * math.sin(TAU * 18 * x))
            transient = (rng.random() * 2 - 1) * math.exp(-45 * x) if x < 0.16 else 0.0
            impact = ((0.38, 0.34, 0.52)[style - 1] * body + 0.18 * transient) * impact_env
            sample_l += impact * 0.68
            sample_r += impact * 0.68

        # 5.15 s — settle tone / logo resolve.
        settle = envelope(t, 5.15, 0.012, (0.20, 0.42, 0.55)[style - 1])
        sx = max(0.0, t - 5.15)
        base = (880.0, 1_046.5, 523.25)[style - 1]
        tone = settle * (0.21 * math.sin(TAU * base * sx) + 0.09 * math.sin(TAU * base * 1.5 * sx))
        pl, pr = pan(tone, 0.10)
        sample_l += pl
        sample_r += pr

        left[i] = sample_l
        right[i] = sample_r

    peak = max(max(abs(v) for v in left), max(abs(v) for v in right), 1e-9)
    gain = 0.68 / peak
    path = OUT / f"{name}.wav"
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for l_value, r_value in zip(left, right):
            frames.extend(struct.pack("<hh", int(max(-1, min(1, l_value * gain)) * 32767), int(max(-1, min(1, r_value * gain)) * 32767)))
        wav.writeframes(frames)
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [
        render_palette("P1-dry-precision", 1),
        render_palette("P2-soft-glass", 2),
        render_palette("P3-cinematic-air", 3),
    ]
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
