from __future__ import annotations

from pathlib import Path


WORKFLOW_NAME = "workflow-contract"
WORKFLOW_INSTALL_ROOT = Path(".agents") / "workflows" / WORKFLOW_NAME
SKILL_INSTALL_ROOT = Path(".agents") / "skills" / WORKFLOW_NAME


def workflow_root() -> Path:
    return Path(__file__).resolve().parents[1]


def project_root() -> Path:
    root = workflow_root()
    if root.parent.name == "workflows" and root.parent.parent.name == ".agents":
        return root.parent.parent.parent
    return Path.cwd().resolve()


def workflow_path(*parts: str) -> Path:
    return workflow_root().joinpath(*parts)


def config_path() -> Path:
    return workflow_path("repo.config.json")


def installed_workflow_rel(*parts: str) -> str:
    return WORKFLOW_INSTALL_ROOT.joinpath(*parts).as_posix()


def installed_skill_rel(*parts: str) -> str:
    return SKILL_INSTALL_ROOT.joinpath(*parts).as_posix()
