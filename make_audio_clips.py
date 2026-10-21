from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def find_first_track(piece_folder: Path) -> Path | None:
    tracks = sorted(piece_folder.rglob("*.mp3"))
    return tracks[0] if tracks else None


def make_clip(track_path: Path, output_path: Path, seconds: float) -> None:
    encoder = shutil.which("ffmpeg")
    if encoder is None:
        raise RuntimeError(
            "Could not find ffmpeg. Install it (e.g. 'winget install ffmpeg') "
            "and make sure ffmpeg is on PATH."
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            encoder,
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(track_path),
            "-t",
            str(seconds),
            "-vn",
            "-c:a",
            "copy",
            str(output_path),
        ],
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create short MP3 clips from the first track of each piece."
    )
    parser.add_argument(
        "--tracks",
        type=Path,
        default=Path("audio/Full_tracks"),
        help="Folder containing one subfolder per music piece (default: audio/Full_tracks)",
    )
    parser.add_argument(
        "--clips",
        type=Path,
        default=Path("audio/clips"),
        help="Folder where clips should be written (default: audio/clips)",
    )
    parser.add_argument(
        "--seconds",
        type=float,
        default=30,
        help="Clip length in seconds (default: 30)",
    )
    args = parser.parse_args()

    if not args.tracks.is_dir():
        print(f"Track folder not found: {args.tracks}", file=sys.stderr)
        return 1
    if args.seconds <= 0:
        print("Seconds must be greater than zero.", file=sys.stderr)
        return 1

    piece_folders = sorted(path for path in args.tracks.iterdir() if path.is_dir())
    if not piece_folders:
        print(f"No piece folders found in {args.tracks}")
        return 0

    created = 0
    for piece_folder in piece_folders:
        track = find_first_track(piece_folder)
        if track is None:
            print(f"Skipped {piece_folder.name}: no .mp3 found")
            continue

        output_path = args.clips / piece_folder.name / track.name
        print(f"Creating {output_path} from {track}")
        try:
            make_clip(track, output_path, args.seconds)
        except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
            print(f"Failed for {piece_folder.name}: {error}", file=sys.stderr)
            return 1
        created += 1

    print(f"Created {created} clip(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
