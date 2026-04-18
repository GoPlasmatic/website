#!/usr/bin/env python3
"""Minify src/ into public/ for deployment.

Reads from ../src and writes to ../public (relative to this script).
  - *.html        minified with htmlmin (keeps <pre>/<textarea>, strips comments)
  - *.css         minified with csscompressor
  - *.js          minified with rjsmin
  - everything    copied verbatim (binaries, SVG, PNG, fonts, ...)

Install deps once:
    pip install htmlmin csscompressor rjsmin

Run:
    python tools/build.py
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

try:
    import htmlmin
    import csscompressor
    import rjsmin
except ImportError as exc:
    sys.exit(
        f"Missing dependency: {exc.name}\n"
        "Install with: pip install htmlmin csscompressor rjsmin"
    )

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "public"

MINIFIERS = {
    ".html": lambda s: htmlmin.minify(
        s,
        remove_comments=True,
        remove_empty_space=True,
        reduce_boolean_attributes=True,
        remove_optional_attribute_quotes=False,
    ),
    ".css": lambda s: csscompressor.compress(s),
    ".js": lambda s: rjsmin.jsmin(s, keep_bang_comments=False),
}


def human_size(n: int) -> str:
    for unit in ("B", "KB", "MB"):
        if n < 1024:
            return f"{n:,.1f} {unit}" if unit != "B" else f"{n:,} B"
        n /= 1024
    return f"{n:,.1f} GB"


def build() -> None:
    if not SRC.is_dir():
        sys.exit(f"Source directory not found: {SRC}")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    total_in = total_out = 0
    counts = {"minified": 0, "copied": 0}

    for src_path in sorted(SRC.rglob("*")):
        if src_path.is_dir():
            continue

        rel = src_path.relative_to(SRC)
        dst_path = OUT / rel
        dst_path.parent.mkdir(parents=True, exist_ok=True)

        minifier = MINIFIERS.get(src_path.suffix.lower())
        in_size = src_path.stat().st_size
        total_in += in_size

        if minifier is not None:
            original = src_path.read_text(encoding="utf-8")
            try:
                minified = minifier(original)
            except Exception as exc:
                sys.exit(f"Failed to minify {rel}: {exc}")
            dst_path.write_text(minified, encoding="utf-8")
            counts["minified"] += 1
        else:
            shutil.copy2(src_path, dst_path)
            counts["copied"] += 1

        out_size = dst_path.stat().st_size
        total_out += out_size
        pct = (1 - out_size / in_size) * 100 if in_size else 0
        tag = "min" if minifier else "cp "
        print(f"  [{tag}] {rel}  {human_size(in_size)} → {human_size(out_size)}  (-{pct:.1f}%)")

    saved = total_in - total_out
    pct = (saved / total_in * 100) if total_in else 0
    print()
    print(f"Minified {counts['minified']} file(s), copied {counts['copied']}.")
    print(f"Total: {human_size(total_in)} → {human_size(total_out)} "
          f"(saved {human_size(saved)}, {pct:.1f}%)")
    print(f"Output: {OUT}")


if __name__ == "__main__":
    build()
