"""One-shot image optimization for the Astro storefront.

Reads PNG/JPG sources from public/assets/, downscales them to a max
dimension and writes WebP copies alongside the originals (keeping the
PNG/JPG as a fallback for tooling that can't ingest WebP). The .astro
templates and shop.js can then use the .webp variant via `<source>`
elements or the new asset paths.

Run from the repo root:
    python scripts/optimize-images.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image

# Per-file max width. Anything wider gets downscaled, preserving aspect.
# Hero photos shown full-bleed → 2400 px. Square thumbs / texture tiles
# → 1600 px. The crest logos are small enough to leave alone.
DEFAULT_MAX_WIDTH = 2400
PER_FILE_MAX_WIDTH = {
    "texture-embroidery-patch.png": 1600,
    "metier-broderie.jpg": 2000,
    "metier-coton.jpg": 2000,
    "metier-polyester.jpg": 2000,
}
# Skip files smaller than this — already small enough that re-encoding
# doesn't help and may add overhead.
MIN_SIZE_TO_PROCESS = 200 * 1024  # 200 KB

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"


def process(src: Path) -> tuple[int, int] | None:
    """Returns (before_bytes, after_bytes) or None if skipped."""
    if src.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        return None
    if src.stat().st_size < MIN_SIZE_TO_PROCESS:
        return None
    dst = src.with_suffix(".webp")
    max_w = PER_FILE_MAX_WIDTH.get(src.name, DEFAULT_MAX_WIDTH)

    img = Image.open(src)
    # Preserve transparency for PNGs; everything else flatten to RGB.
    has_alpha = img.mode in ("RGBA", "LA") or (
        img.mode == "P" and "transparency" in img.info
    )
    if has_alpha:
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    if img.width > max_w:
        ratio = max_w / img.width
        new_size = (max_w, round(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # Quality 80 is the sweet spot for photos: visually indistinguishable
    # from quality 95, ~40% smaller. For PNG-with-alpha the encoder still
    # does the right thing.
    img.save(dst, "WEBP", quality=80, method=6)
    return src.stat().st_size, dst.stat().st_size


def main() -> int:
    if not ASSETS.exists():
        print(f"assets dir not found: {ASSETS}", file=sys.stderr)
        return 1
    total_before = total_after = 0
    n_processed = 0
    for src in sorted(ASSETS.iterdir()):
        try:
            result = process(src)
        except Exception as exc:  # noqa: BLE001
            print(f"  ERR {src.name}: {exc}")
            continue
        if result is None:
            continue
        before, after = result
        n_processed += 1
        total_before += before
        total_after += after
        ratio = (1 - after / before) * 100
        print(
            f"  {src.name:<40} {before/1024:>8.0f} KB -> "
            f"{after/1024:>6.0f} KB ({ratio:>4.0f}% smaller)"
        )
    if not n_processed:
        print("No images to process.")
        return 0
    print()
    print(
        f"Total: {n_processed} files, "
        f"{total_before/1024/1024:.1f} MB -> "
        f"{total_after/1024/1024:.1f} MB "
        f"({(1 - total_after/total_before)*100:.0f}% smaller, "
        f"{(total_before-total_after)/1024/1024:.1f} MB saved)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
