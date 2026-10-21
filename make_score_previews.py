from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_full_score(piece_folder: Path) -> Path | None:
    scores = sorted(
        path
        for path in piece_folder.rglob("*.pdf")
        if "full score" in path.stem.lower()
    )
    return scores[0] if scores else None


def render_first_page(pdf_path: Path, output_path: Path, dpi: int) -> None:
    renderer = shutil.which("pdftoppm")
    if renderer is None:
        raise RuntimeError(
            "Could not find pdftoppm. Install Poppler/MiKTeX and make sure "
            "pdftoppm is on PATH."
        )

    try:
        from PIL import Image
    except ImportError as error:
        raise RuntimeError(
            "Pillow is required. Install it with: py -m pip install Pillow"
        ) from error

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as temporary_directory:
        temporary_prefix = Path(temporary_directory) / "score-page"
        subprocess.run(
            [
                renderer,
                "-f",
                "1",
                "-l",
                "1",
                "-r",
                str(dpi),
                str(pdf_path),
                str(temporary_prefix),
            ],
            check=True,
        )

        rendered_pages = sorted(Path(temporary_directory).glob("score-page-*.ppm"))
        if not rendered_pages:
            raise RuntimeError(f"No rendered page was created for {pdf_path}")

        with Image.open(rendered_pages[0]) as page_image:
            page_image.save(output_path, format="PNG")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create page-one PNG previews from each piece's full-score PDF."
    )
    parser.add_argument(
        "--pdfs",
        type=Path,
        default=Path("pdfs"),
        help="Folder containing one subfolder per music piece (default: pdfs)",
    )
    parser.add_argument(
        "--images",
        type=Path,
        default=Path("images"),
        help="Folder where previews should be written (default: images)",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=150,
        help="Preview resolution (default: 150)",
    )
    args = parser.parse_args()

    if not args.pdfs.is_dir():
        print(f"PDF folder not found: {args.pdfs}", file=sys.stderr)
        return 1
    if args.dpi <= 0:
        print("DPI must be greater than zero.", file=sys.stderr)
        return 1

    piece_folders = sorted(path for path in args.pdfs.iterdir() if path.is_dir())
    if not piece_folders:
        print(f"No piece folders found in {args.pdfs}")
        return 0

    created = 0
    for piece_folder in piece_folders:
        full_score = find_full_score(piece_folder)
        if full_score is None:
            print(f"Skipped {piece_folder.name}: no '*Full score*.pdf' found")
            continue

        output_path = args.images / piece_folder.name / "full-score-page-1.png"
        print(f"Creating {output_path} from {full_score}")
        try:
            render_first_page(full_score, output_path, args.dpi)
        except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
            print(f"Failed for {piece_folder.name}: {error}", file=sys.stderr)
            return 1
        created += 1

    print(f"Created {created} preview(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
