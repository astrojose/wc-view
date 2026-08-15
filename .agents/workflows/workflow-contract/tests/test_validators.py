from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCENARIOS = json.loads((ROOT / "tests/fixtures/scenarios.json").read_text(encoding="utf-8"))


def skill_source() -> Path:
    source_checkout = ROOT / ".agents/skills/workflow-contract"
    if source_checkout.is_dir():
        return source_checkout
    installed_skill = ROOT.parent.parent / "skills/workflow-contract"
    if installed_skill.is_dir():
        return installed_skill
    raise FileNotFoundError("workflow-contract skill is not available beside the workflow")


def render_task(scenario: dict) -> str:
    work_class = scenario["class"]
    status = scenario["status"]
    outcome = scenario["outcome"]
    coordination = scenario.get("coordination", "single-repo")
    reclassified = scenario.get("reclassified", "not applicable")
    result = scenario.get("evidence_result", "pass")
    revision = scenario.get("reviewed_revision", "abc1234")
    proposal = "docs/changes/proposed/auth.md" if work_class == "decision" else "not applicable"
    investigation = (
        "- Symptom: login returns 500\n"
        "- Environment: local test\n"
        "- Safety boundary: read-only diagnostics\n"
        "- Reproduction: run the auth request\n"
        "- Evidence: captured response\n"
        if work_class == "incident"
        else "- Not applicable: work is not classified as incident.\n"
    )
    cross_repo = (
        "- Participating repositories: api, mobile\n"
        "- Shared contracts: login response\n"
        "- Invariants: backward compatibility\n"
        "- Integration owner: API maintainer\n"
        "- Dependency order: API then mobile\n"
        if coordination == "cross-repo"
        else "- Not applicable: single-repo work.\n"
    )
    decision = "accept the required auth behavior" if outcome == "decision-required" else "none found"
    design_alignment = "contract drift requires alignment" if outcome == "design-drift" else "aligned"
    evidence = "test output" if result == "pass" else "pending proof"
    agent_context = (
        "- Skills:\n    - workflow-contract\n"
        "- Proposal: " + proposal + "\n"
        "- Design docs:\n    - docs/design/auth.md\n"
        "- Constraints:\n    - useLoaderData<typeof loader>() remains supported\n"
        "- Do not touch:\n    - production"
        if scenario.get("multiline_agent_context")
        else f"- Skills: workflow-contract\n- Proposal: {proposal}\n- Design docs: docs/design/auth.md\n- Constraints: bounded test fixture\n- Do not touch: production"
    )
    follow_up = (
        "Replacement: docs/implementation/tasks/replacement.md"
        if outcome == "superseded"
        else "Repeat Review after resolving the recorded outcome."
    )
    return f"""# Task — {scenario['name']}

## Status

- {status}

## Work Classification

- Class: {work_class}
- Coordination: {coordination}
- Reclassified from: {reclassified}

## Linked Phase

- Phase 01

## Agent Context

{agent_context}

## Authority

- Allowed: edit fixture files
- Requires approval: scope expansion
- Prohibited: deployment

## Objective

Verify the {scenario['name']} workflow scenario.

## Scope Boundary

**In scope:**
- fixtures/{scenario['name']}

**Out of scope:**
- production

## Acceptance Criteria

- [x] AC-01: The declared scenario satisfies its expected workflow state.

## Dependencies

- None.

## Implementation Checklist

- [x] Build the scenario.

## Verification

- Command: python3 validator
- Evidence: validator output

## Investigation

{investigation}
## Cross-Repository Coordination

{cross_repo}
## Reconciliation

- Outcome: {outcome}
- Reviewed revision: {revision}
- Environment: local fixture
- Reviewed at: 2026-08-12T12:00:00Z
- Reviewer: unittest

### Acceptance Evidence

| Criterion | Result | Evidence |
|---|---|---|
| AC-01 | {result} | {evidence} |

### Alignment

- Design vs implementation: {design_alignment}
- Planned vs actual scope: aligned
- Documentation drift: none
- Deferred gaps: none
- Newly discovered decisions: {decision}

### Follow-up

- {follow_up}
"""


class ValidatorRegressionTests(unittest.TestCase):
    def make_consumer(self, parent: Path) -> Path:
        project = parent / "consumer"
        workflow = project / ".agents/workflows/workflow-contract"
        workflow.parent.mkdir(parents=True)
        shutil.copytree(
            ROOT,
            workflow,
            ignore=shutil.ignore_patterns(".git", ".agents", "dist", "__pycache__", "*.pyc"),
        )
        skill = project / ".agents/skills/workflow-contract"
        skill.parent.mkdir(parents=True)
        shutil.copytree(skill_source(), skill)
        init = subprocess.run(
            ["python3", str(workflow / "scripts/init_workflow_contract.py")],
            cwd=project,
            text=True,
            capture_output=True,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
            check=False,
        )
        self.assertEqual(init.returncode, 0, init.stdout + init.stderr)
        return project

    def run_validator(self, project: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(project / ".agents/workflows/workflow-contract/scripts/validate_workflow.py")],
            cwd=project,
            text=True,
            capture_output=True,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
            check=False,
        )

    def test_declared_scenarios(self) -> None:
        for scenario in SCENARIOS:
            with self.subTest(scenario=scenario["name"]), tempfile.TemporaryDirectory() as tmp:
                project = self.make_consumer(Path(tmp))
                task = project / "docs/implementation/tasks/scenario.md"
                task.write_text(render_task(scenario), encoding="utf-8")
                result = self.run_validator(project)
                output = result.stdout + result.stderr
                if scenario["valid"]:
                    self.assertEqual(result.returncode, 0, output)
                    self.assertIn("WORKFLOW:ok", output)
                else:
                    self.assertNotEqual(result.returncode, 0, output)
                    self.assertIn(scenario["finding"], output)

    def test_config_v1_fails_fast_with_migration_guidance(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            project = self.make_consumer(Path(tmp))
            config_path = project / ".agents/workflows/workflow-contract/repo.config.json"
            v1 = json.loads((ROOT / "tests/fixtures/repo.config.v1.json").read_text(encoding="utf-8"))
            config = json.loads(config_path.read_text(encoding="utf-8"))
            config.update(v1)
            config_path.write_text(json.dumps(config), encoding="utf-8")
            result = self.run_validator(project)
            output = result.stdout + result.stderr
            self.assertNotEqual(result.returncode, 0, output)
            self.assertIn("follow-compatibility/migrate-v0.3.0-to-v0.4.0.md", output)
            self.assertIn("WORKFLOW:failed:config", output)
            self.assertNotIn("STRUCTURE:", output)

    def test_status_validator_uses_newest_date_not_file_order(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            project = self.make_consumer(Path(tmp))
            status_path = project / "docs/implementation/status/weekly-status.md"
            current = status_path.read_text(encoding="utf-8")
            status_path.write_text(current + "\n## 2020-01-01\n\n- historical entry\n", encoding="utf-8")
            result = self.run_validator(project)
            output = result.stdout + result.stderr
            self.assertEqual(result.returncode, 0, output)
            self.assertIn("WORKFLOW:ok", output)


if __name__ == "__main__":
    unittest.main()
