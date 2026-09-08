from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image


FRAME_SIZE = (1600, 900)


def convert_frame(source: Path, destination: Path) -> tuple[Path, tuple[int, int]]:
    with Image.open(source) as image:
        rgb_image = image.convert("RGB")
        resized = rgb_image.resize(FRAME_SIZE, Image.Resampling.LANCZOS)
        resized.save(destination, "WEBP", quality=82, method=4)

    return destination, FRAME_SIZE


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert project-intro TIFF frames into web-ready WebP frames.")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--workers", type=int, default=3)
    args = parser.parse_args()

    source_files = sorted(args.source.glob("项目引入_*.tiff"))

    if len(source_files) != 301:
        raise SystemExit(f"Expected 301 TIFF frames, found {len(source_files)}")

    args.destination.mkdir(parents=True, exist_ok=True)
    jobs = []

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        for index, source in enumerate(source_files):
            destination = args.destination / f"project-intro-{index:03d}.webp"

            if destination.exists():
                jobs.append(None)
                continue

            jobs.append(executor.submit(convert_frame, source, destination))

        completed = 0

        for job in jobs:
            if job is None:
                completed += 1
                continue

            destination, size = job.result()
            completed += 1
            print(f"[{completed:03d}/301] {destination.name} {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
