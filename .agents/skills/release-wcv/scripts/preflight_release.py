#!/usr/bin/env python3
"""Preflight checks for wc-view releases.

This script is intentionally non-publishing. It validates local release state
and runs deterministic checks before a human-approved publish step.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


PACKAGE_NAME = "@astrojose/wc-view"
BIN_NAME = "wc-view"
PLUGIN_NAME = "wc-view"
CLAUDE_PLUGIN_PATH = Path(".claude-plugin/plugin.json")
CODEX_PLUGIN_PATH = Path(".codex-plugin/plugin.json")
DISALLOWED_PACK_PREFIXES = (
    ".agents/",
    ".claude/",
    ".junie/",
    "docs/",
    "node_modules/",
    "src/",
    "wc-view Design System/",
)
DISALLOWED_PACK_NAMES = {
    ".env",
    ".env.local",
    ".env.production",
    ".DS_Store",
    "package-lock.json",
}


def run(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    print(f"$ {' '.join(command)}")
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if result.stdout:
        print(result.stdout.rstrip())
    return result


def fail(message: str) -> None:
    print(f"PREFLIGHT:failed:{message}", file=sys.stderr)
    raise SystemExit(1)


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing-file:{path}")
    except json.JSONDecodeError as error:
        fail(f"invalid-json:{path}:{error}")


def changelog_has_version(changelog: str, version: str) -> bool:
    pattern = rf"^## \[{re.escape(version)}\] - \d{{4}}-\d{{2}}-\d{{2}}$"
    return re.search(pattern, changelog, flags=re.MULTILINE) is not None


def validate_pack_output(output: str) -> None:
    try:
        payload = json.loads(output)
    except json.JSONDecodeError as error:
        fail(f"npm-pack-json:{error}")
    if not isinstance(payload, list) or not payload:
        fail("npm-pack-json:empty")

    files = payload[0].get("files", [])
    paths = [item.get("path", "") for item in files if isinstance(item, dict)]
    for path in paths:
        if path in DISALLOWED_PACK_NAMES:
            fail(f"npm-pack-disallowed:{path}")
        if any(path.startswith(prefix) for prefix in DISALLOWED_PACK_PREFIXES):
            fail(f"npm-pack-disallowed:{path}")

    required = {"package.json", "CHANGELOG.md", "dist/bin/wc-view.js"}
    missing = sorted(required - set(paths))
    if missing:
        fail(f"npm-pack-missing:{','.join(missing)}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run wc-view release preflight checks.")
    parser.add_argument("--version", required=True, help="Target semver version, without v prefix.")
    parser.add_argument("--skip-commands", action="store_true", help="Only run static checks.")
    args = parser.parse_args()

    if not re.match(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$", args.version):
        fail(f"invalid-version:{args.version}")

    root = Path.cwd()
    package_json = read_json(root / "package.json")
    package_lock = read_json(root / "package-lock.json")
    changelog_path = root / "CHANGELOG.md"

    if package_json.get("name") != PACKAGE_NAME:
        fail(f"package-name:{package_json.get('name')}!= {PACKAGE_NAME}")
    if package_json.get("version") != args.version:
        fail(f"package-json-version:{package_json.get('version')}!= {args.version}")
    if package_json.get("bin", {}).get(BIN_NAME) != "dist/bin/wc-view.js":
        fail("bin-path:wc-view must point to dist/bin/wc-view.js")
    if package_lock.get("name") != PACKAGE_NAME:
        fail("package-lock-name")
    if package_lock.get("version") != args.version:
        fail("package-lock-version")
    if package_lock.get("packages", {}).get("", {}).get("name") != PACKAGE_NAME:
        fail("package-lock-root-name")
    if package_lock.get("packages", {}).get("", {}).get("version") != args.version:
        fail("package-lock-root-version")

    claude_plugin = read_json(root / CLAUDE_PLUGIN_PATH)
    codex_plugin = read_json(root / CODEX_PLUGIN_PATH)
    if claude_plugin.get("name") != PLUGIN_NAME:
        fail(f"claude-plugin-name:{claude_plugin.get('name')}")
    if claude_plugin.get("version") != args.version:
        fail(f"claude-plugin-version:{claude_plugin.get('version')}!= {args.version}")
    if codex_plugin.get("name") != PLUGIN_NAME:
        fail(f"codex-plugin-name:{codex_plugin.get('name')}")
    if codex_plugin.get("version") != args.version:
        fail(f"codex-plugin-version:{codex_plugin.get('version')}!= {args.version}")

    try:
        changelog = changelog_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail("missing-file:CHANGELOG.md")

    if not changelog.startswith("# Changelog\n"):
        fail("changelog-title")
    if "## [Unreleased]" not in changelog:
        fail("changelog-unreleased-section")
    if not changelog_has_version(changelog, args.version):
        fail(f"changelog-version:{args.version}")

    if args.skip_commands:
        print("PREFLIGHT:ok:static")
        return 0

    commands = [
        ["./node_modules/.bin/tsc", "--noEmit"],
        ["npm", "test"],
        ["npm", "run", "build"],
        ["npm", "run", "validate:workflow"],
        ["claude", "plugin", "validate", "."],
    ]
    for command in commands:
        result = run(command, root)
        if result.returncode != 0:
            fail(f"command:{' '.join(command)}")

    pack_result = run(["npm", "pack", "--dry-run", "--json"], root)
    if pack_result.returncode != 0:
        fail("command:npm pack --dry-run --json")
    validate_pack_output(pack_result.stdout)

    print("PREFLIGHT:ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
