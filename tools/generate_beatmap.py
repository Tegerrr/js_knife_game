#!/usr/bin/env python3
"""
Генератор beatmap из аудиофайла.
Использует librosa для onset detection.

Использование:
    python3 generate_beatmap.py track.wav
    python3 generate_beatmap.py track.ogg --output beatmap.json

Выход: JSON файл с массивом {time_ms, zone}
"""

import sys
import json
import argparse
import librosa
import numpy as np


def generate_beatmap(audio_path: str, zone_count: int = 5, sensitivity: float = 0.3, min_gap_ms: int = 300) -> list[dict]:
    # Загрузка аудио
    y, sr = librosa.load(audio_path, sr=None)

    # Onset detection — sensitivity: 0.0 (все подряд) - 1.0 (только сильные удары)
    # delta — порог чувствительности onset detection
    delta = sensitivity * 0.3  # scale to librosa's range
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True, delta=delta)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # Фильтрация: минимальный промежуток между нотами
    filtered_times = []
    for t in onset_times:
        if len(filtered_times) == 0 or (t - filtered_times[-1]) * 1000 >= min_gap_ms:
            filtered_times.append(t)

    # Генерация паттерна зон (1→2→3→4→5→4→3→2→1...)
    pattern = list(range(zone_count)) + list(range(zone_count - 2, 0, -1))

    beatmap = []
    for i, t in enumerate(filtered_times):
        zone = pattern[i % len(pattern)]
        beatmap.append({
            "time_ms": round(float(t) * 1000),
            "zone": zone
        })

    return beatmap


def main():
    parser = argparse.ArgumentParser(description="Generate beatmap from audio file")
    parser.add_argument("audio", help="Path to audio file (wav, ogg, mp3)")
    parser.add_argument("--output", "-o", default=None, help="Output JSON file path")
    parser.add_argument("--zones", "-z", type=int, default=5, help="Number of zones (default: 5)")
    parser.add_argument("--sensitivity", "-s", type=float, default=0.5, help="Sensitivity 0.0 (all) - 1.0 (only strong hits). Default: 0.5")
    parser.add_argument("--min-gap", "-g", type=int, default=300, help="Minimum gap between notes in ms (default: 300)")
    args = parser.parse_args()

    output_path = args.output
    if output_path is None:
        base = args.audio.rsplit(".", 1)[0]
        output_path = base + "_beatmap.json"

    beatmap = generate_beatmap(args.audio, args.zones, args.sensitivity, args.min_gap)

    with open(output_path, "w") as f:
        json.dump(beatmap, f, indent=2)

    print(f"Generated {len(beatmap)} notes")
    print(f"Saved to: {output_path}")

    # Превью первых 10 нот
    for note in beatmap[:10]:
        print(f"  {note['time_ms']}ms -> zone {note['zone'] + 1}")
    if len(beatmap) > 10:
        print(f"  ... and {len(beatmap) - 10} more")


if __name__ == "__main__":
    main()
