#!/usr/bin/env python3
"""Minify src/ into public/ for deployment.

Reads from ../src and writes to ../public (relative to this script).
  - *.html        minified with htmlmin (keeps <pre>/<textarea>, strips comments)
  - *.css         minified with csscompressor
  - *.js          tagged-template contents minified (html`…`, glsl`…`),
                  then the whole file run through terser (mangle + compress;
                  property mangling is *off* — Three.js uniform/attribute
                  keys are looked up by literal string inside shaders)
  - *.svg         minified with svgo (default preset; viewBox preserved)
  - everything    copied verbatim (binaries, PNG, fonts, ...)

Install deps once:
    pip install htmlmin csscompressor
    npm install                     # installs terser + svgo into node_modules/

Run:
    python tools/build.py
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    import htmlmin
    import csscompressor
except ImportError as exc:
    sys.exit(
        f"Missing dependency: {exc.name}\n"
        "Install with: pip install htmlmin csscompressor"
    )

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "public"
TERSER = ROOT / "node_modules" / ".bin" / "terser"
SVGO = ROOT / "node_modules" / ".bin" / "svgo"

for tool in (TERSER, SVGO):
    if not tool.exists():
        sys.exit(
            f"{tool.name} not found at {tool}\n"
            "Install with: npm install  (from the repo root)"
        )


# ── GLSL minifier ──────────────────────────────────────────────────────
#
# Strips comments and collapses whitespace around punctuation/operators.
# Safe for WebGL1 shaders without #version / #define directives — which
# is what Three.js ShaderMaterial expects.

_GLSL_BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
_GLSL_LINE_COMMENT = re.compile(r"//[^\n]*")
_GLSL_WS = re.compile(r"\s+")
_GLSL_PUNCT = re.compile(r"\s*([{};,()=*+\-/<>?:!&|^%\[\]])\s*")


def minify_glsl(src: str) -> str:
    s = _GLSL_BLOCK_COMMENT.sub("", src)
    s = _GLSL_LINE_COMMENT.sub("", s)
    s = _GLSL_WS.sub(" ", s)
    s = _GLSL_PUNCT.sub(r"\1", s)
    return s.strip()


# ── HTML-in-template-literal minifier ──────────────────────────────────
#
# Works on a template-literal body that may contain ${…} interpolation.
# Strategy: swap each ${…} for a unique placeholder, run htmlmin on the
# scrubbed string, then swap the placeholders back in. Protecting the
# interpolations keeps htmlmin from rewriting JS expressions.

_INTERP = re.compile(r"\$\{[^{}]*\}")


def minify_html_template(src: str) -> str:
    holes: list[str] = []

    def stash(m: re.Match[str]) -> str:
        holes.append(m.group(0))
        return f"__TPL_HOLE_{len(holes) - 1}__"

    scrubbed = _INTERP.sub(stash, src)
    mini = htmlmin.minify(
        scrubbed,
        remove_comments=True,
        remove_empty_space=True,
        reduce_boolean_attributes=True,
        remove_optional_attribute_quotes=False,
    )
    for i, h in enumerate(holes):
        mini = mini.replace(f"__TPL_HOLE_{i}__", h)
    return mini.strip()


# ── Tagged-template scanner ────────────────────────────────────────────
#
# Finds `<tag>` followed by a backtick-delimited template literal and
# returns (start, end, body_start, body_end) spans. Handles ${…} with
# nested braces and `\`` / `\\` escapes. Skips any literal that contains
# a `${` with an embedded string or nested template — we flag it rather
# than risk a bad rewrite.


def find_tagged_templates(src: str, tag: str):
    pat = re.compile(r"(?<![A-Za-z0-9_$])" + re.escape(tag) + r"`")
    pos = 0
    while True:
        m = pat.search(src, pos)
        if not m:
            return
        body_start = m.end()
        i = body_start
        depth = 0
        ok = True
        while i < len(src):
            c = src[i]
            if c == "\\":
                i += 2
                continue
            if depth == 0 and c == "`":
                yield (m.start(), i + 1, body_start, i)
                pos = i + 1
                break
            if c == "$" and i + 1 < len(src) and src[i + 1] == "{":
                depth += 1
                i += 2
                continue
            if depth > 0:
                # Nested strings / templates inside ${…} are too risky to
                # parse with regex; bail on this literal.
                if c in ("'", '"', "`"):
                    ok = False
                    break
                if c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
            i += 1
        else:
            return
        if not ok:
            pos = m.end()


def rewrite_tagged_templates(src: str, tag: str, minify):
    spans = list(find_tagged_templates(src, tag))
    if not spans:
        return src
    out = []
    last = 0
    for start, end, bstart, bend in spans:
        out.append(src[last:bstart])
        out.append(minify(src[bstart:bend]))
        last = bend
    out.append(src[last:])
    return "".join(out)


# ── File minifiers ─────────────────────────────────────────────────────


# ── Terser wrapper ─────────────────────────────────────────────────────
#
# Mangle + compress; --toplevel renames module-scope helpers (html, glsl,
# NAV_ITEMS, …). Property mangling stays off because Three.js matches
# uniform / attribute keys by the exact string used in the GLSL source.

_TERSER_ARGS = [
    "--compress", "passes=2,pure_getters,unsafe_arrows",
    "--mangle", "toplevel",
    "--format", "comments=false",
    "--ecma", "2020",
    "--module",
]


def minify_js(src: str) -> str:
    src = rewrite_tagged_templates(src, "glsl", minify_glsl)
    src = rewrite_tagged_templates(src, "html", minify_html_template)
    result = subprocess.run(
        [str(TERSER), *_TERSER_ARGS],
        input=src,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "terser failed")
    return result.stdout


# ── SVGO wrapper ───────────────────────────────────────────────────────
#
# Default preset strips Illustrator/editor metadata, comments, unused
# namespaces, and collapses numeric precision. viewBox is preserved so
# responsive sizing keeps working.

_SVGO_ARGS = ["--input", "-", "--output", "-"]


def minify_svg(src: str) -> str:
    result = subprocess.run(
        [str(SVGO), *_SVGO_ARGS],
        input=src,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "svgo failed")
    return result.stdout


MINIFIERS = {
    ".html": lambda s: htmlmin.minify(
        s,
        remove_comments=True,
        remove_empty_space=True,
        reduce_boolean_attributes=True,
        remove_optional_attribute_quotes=False,
    ),
    ".css": lambda s: csscompressor.compress(s),
    ".js": minify_js,
    ".svg": minify_svg,
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
