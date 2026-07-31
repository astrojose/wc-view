#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path.cwd().resolve()
CANONICAL_VALIDATOR = ROOT / ".agents/workflows/workflow-contract/scripts/validate_workflow.py"


def main() -> int:
    result = subprocess.run(
        [sys.executable, str(CANONICAL_VALIDATOR)],
        cwd=ROOT,
        check=False,
    )
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
