#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from workflow_paths import project_root, workflow_root

ROOT = project_root()
WORKFLOW_ROOT = workflow_root()
SCRIPTS = [
    "validate_structure.py",
    "validate_metadata.py",
    "validate_readiness.py",
    "validate_scope_conflicts.py",
    "validate_transitions.py",
    "validate_references.py",
]


def main() -> int:
    failures = 0
    for script in SCRIPTS:
        path = WORKFLOW_ROOT / "scripts" / script
        result = subprocess.run(
            [sys.executable, str(path)],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        if result.stdout:
            print(result.stdout.strip())
        if result.stderr:
            print(result.stderr.strip())
        if result.returncode != 0:
            failures += 1

    if failures:
        print(f"WORKFLOW:failed:{failures}-validator(s)")
        return 1

    print("WORKFLOW:ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
