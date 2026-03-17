#!/usr/bin/env python3
"""Optimize CMS-uploaded images and rewrite content references.

This script looks for references to original uploads in content files,
generates auto-oriented WebP variants, and rewrites matching references to the
optimized paths. It is designed to be safe to run repeatedly.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


UPLOADS_PREFIX = "/assets/images/uploads/"
TEXT_FILE_SUFFIXES = {".yml", ".yaml", ".md", ".markdown", ".html", ".txt"}
SKIP_DIRS = {".git", ".github", ".jekyll-cache", "_site", "node_modules", "vendor"}
ALLOWED_INPUT_SUFFIXES = {".jpg", ".jpeg", ".png"}
TARGET_WIDTH = 1200


@dataclass(frozen=True)
class ConversionPlan:
    source_public_path: str
    source_file: Path
    output_public_path: str
    output_file: Path
    quality: int


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def detect_changed_paths(root: Path) -> set[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
        cwd=root,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return set()
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def iter_text_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() not in TEXT_FILE_SUFFIXES:
            continue
        files.append(path)
    return files


def build_output_name(source_name: str) -> str:
    path = Path(source_name)
    stem = path.stem
    suffix = path.suffix.lower()
    if suffix == ".png":
        return f"{stem}.webp"
    return f"{stem}-{TARGET_WIDTH}w.webp"


def build_plan(root: Path, public_path: str) -> ConversionPlan | None:
    source_rel = public_path.lstrip("/")
    source_file = root / source_rel
    if not source_file.exists():
        return None

    suffix = source_file.suffix.lower()
    if suffix not in ALLOWED_INPUT_SUFFIXES:
        return None

    output_name = build_output_name(source_file.name)
    output_rel = source_file.parent.relative_to(root) / output_name
    output_public_path = f"/{output_rel.as_posix()}"
    output_file = root / output_rel
    quality = 85 if suffix == ".png" else 82
    return ConversionPlan(public_path, source_file, output_public_path, output_file, quality)


def optimize_image(plan: ConversionPlan) -> None:
    plan.output_file.parent.mkdir(parents=True, exist_ok=True)
    temp_file = Path("/tmp") / f"{plan.output_file.stem}-tmp.png"
    try:
        run(
            [
                "magick",
                str(plan.source_file),
                "-auto-orient",
                "-resize",
                f"{TARGET_WIDTH}x>",
                str(temp_file),
            ]
        )
        run(
            [
                "cwebp",
                "-quiet",
                "-q",
                str(plan.quality),
                str(temp_file),
                "-o",
                str(plan.output_file),
            ]
        )
    finally:
        if temp_file.exists():
            temp_file.unlink()


def replace_references(root: Path, replacements: dict[str, str]) -> list[Path]:
    updated_files: list[Path] = []
    if not replacements:
        return updated_files

    pattern = re.compile("|".join(re.escape(key) for key in sorted(replacements, key=len, reverse=True)))

    for file_path in iter_text_files(root):
        original = file_path.read_text(encoding="utf-8")
        updated = pattern.sub(lambda match: replacements[match.group(0)], original)
        if updated != original:
            file_path.write_text(updated, encoding="utf-8")
            updated_files.append(file_path)

    return updated_files


def collect_target_paths(root: Path, changed_paths: set[str]) -> set[str]:
    target_public_paths: set[str] = set()
    uploads_dir = root / "assets/images/uploads"

    if changed_paths:
        for changed_path in changed_paths:
            changed = Path(changed_path)
            if uploads_dir in (root / changed).parents or (root / changed) == uploads_dir:
                public_path = f"/{changed.as_posix()}"
                plan = build_plan(root, public_path)
                if plan:
                    target_public_paths.add(public_path)

    content_pattern = re.compile(r"/assets/images/uploads/[^\s\"')>]+")
    for file_path in iter_text_files(root):
        text = file_path.read_text(encoding="utf-8")
        for match in content_pattern.findall(text):
            plan = build_plan(root, match)
            if not plan:
                continue
            if changed_paths and match not in target_public_paths and plan.output_file.exists():
                continue
            target_public_paths.add(match)

    return target_public_paths


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Optimize CMS uploads and rewrite references.")
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument(
        "--paths",
        nargs="*",
        default=None,
        help="Optional changed paths to limit optimization scope",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned actions without writing files",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()

    changed_paths = set(args.paths or [])
    if not changed_paths:
        changed_paths = detect_changed_paths(root)

    target_public_paths = collect_target_paths(root, changed_paths)
    plans = [plan for path in sorted(target_public_paths) if (plan := build_plan(root, path))]

    if not plans:
        print("No CMS uploads need optimization.")
        return 0

    replacements = {plan.source_public_path: plan.output_public_path for plan in plans}

    for plan in plans:
        print(f"Optimize {plan.source_public_path} -> {plan.output_public_path}")
        if not args.dry_run:
            optimize_image(plan)

    updated_files = replace_references(root, replacements) if not args.dry_run else []

    if updated_files:
        print("Updated references in:")
        for file_path in updated_files:
            print(f" - {file_path.relative_to(root)}")
    else:
        print("No content references needed rewriting.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
