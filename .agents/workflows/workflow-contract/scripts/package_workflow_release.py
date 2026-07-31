#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import tarfile
import tempfile
from pathlib import Path

from workflow_paths import WORKFLOW_NAME


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EXCLUDES = {
    ".git",
    ".agents",
    "__pycache__",
    ".DS_Store",
}


def load_metadata() -> dict:
    with (ROOT / "workflow.json").open("r", encoding="utf-8") as file:
        return json.load(file)


def ignore_names(_: str, names: list[str]) -> set[str]:
    return {name for name in names if name in DEFAULT_EXCLUDES or name.endswith(".pyc")}


def copy_workflow(dest: Path) -> None:
    workflow_dest = dest / "workflows" / WORKFLOW_NAME
    shutil.copytree(ROOT, workflow_dest, ignore=ignore_names)


def copy_skill(dest: Path, skill_name: str) -> None:
    source = ROOT / ".agents" / "skills" / skill_name
    if not source.is_dir():
        raise SystemExit(f"Missing workflow skill: {source}")
    shutil.copytree(source, dest / "skills" / skill_name, ignore=ignore_names)


def write_manifest(dest: Path, metadata: dict) -> None:
    skill_name = metadata.get("skill", metadata["name"])
    manifest = {
        "version": 1,
        "workflows": [
            {
                "name": metadata["name"],
                "title": metadata.get("title", metadata["name"]),
                "description": metadata.get("description", ""),
                "version": metadata.get("version", "0.0.0"),
                "skill": skill_name,
                "workflow_path": f"workflows/{metadata['name']}",
                "skill_path": f"skills/{skill_name}",
            }
        ],
    }
    (dest / "workflows.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def make_archive(staging: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(output, "w:gz") as archive:
        for path in sorted(staging.rglob("*")):
            archive.add(path, arcname=path.relative_to(staging), recursive=False)


def main() -> int:
    parser = argparse.ArgumentParser(description="Package workflow-contract release assets.")
    parser.add_argument("--version", help="Release version. Defaults to workflow.json version.")
    parser.add_argument("--out-dir", type=Path, default=ROOT / "dist", help="Output directory.")
    args = parser.parse_args()

    metadata = load_metadata()
    version = args.version or metadata.get("version", "0.0.0")
    metadata["version"] = version
    archive_name = f"ipf-workflows-v{version}.tar.gz"

    with tempfile.TemporaryDirectory(prefix="ipf-workflows-") as tmp:
        staging = Path(tmp)
        copy_workflow(staging)
        copy_skill(staging, metadata.get("skill", metadata["name"]))
        write_manifest(staging, metadata)
        make_archive(staging, args.out_dir / archive_name)

    manifest_path = args.out_dir / f"ipf-workflows-v{version}.json"
    manifest_path.write_text(
        json.dumps(
            {
                "version": version,
                "asset": archive_name,
                "workflow": metadata["name"],
                "skill": metadata.get("skill", metadata["name"]),
            },
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {args.out_dir / archive_name}")
    print(f"wrote {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
