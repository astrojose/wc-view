from __future__ import annotations

import re


FIELD_RE = re.compile(r"^-\s+([^:]+):\s*(.*)$")
CRITERION_RE = re.compile(r"^-\s+\[[ xX]\]\s+(AC-\d{2,}):\s+(.+)$")
SHA_RE = re.compile(r"^[0-9a-f]{7,40}$")

PLACEHOLDERS = {
    "",
    "-",
    "pending",
    "pending review",
    "not applicable",
    "n/a",
    "none",
    "tbd",
    "yyyy-mm-dd",
    "yyyy-mm-ddthh:mm:ssz",
}


def normalize(value: str) -> str:
    return value.strip().strip("`").strip().lower()


def section(text: str, heading: str, level: int = 2) -> str:
    prefix = "#" * level
    match = re.search(rf"^{prefix}\s+{re.escape(heading)}\s*$", text, re.MULTILINE)
    if not match:
        return ""
    after = text[match.end() :]
    next_heading = re.search(rf"^#{{1,{level}}}\s+", after, re.MULTILINE)
    return after[: next_heading.start()] if next_heading else after


def field(text: str, heading: str, label: str, level: int = 2) -> str:
    lines = section(text, heading, level=level).splitlines()
    for index, line in enumerate(lines):
        match = FIELD_RE.match(line.strip())
        if match and normalize(match.group(1)) == normalize(label):
            inline = match.group(2).strip().strip("`")
            if inline:
                return inline
            continuation: list[str] = []
            for next_line in lines[index + 1:]:
                if next_line.startswith("- ") and FIELD_RE.match(next_line):
                    break
                value = next_line.strip().lstrip("-").strip().strip("`")
                if value:
                    continuation.append(value)
            return " ".join(continuation)
    return ""


def status(text: str) -> str:
    block = section(text, "Status")
    for line in block.splitlines():
        cleaned = normalize(line.lstrip("-").strip())
        if cleaned and not cleaned.startswith("last updated"):
            return cleaned.split("|", 1)[0].strip()
    return ""


def is_populated(value: str) -> bool:
    normalized = normalize(value)
    return normalized not in PLACEHOLDERS and re.fullmatch(r"<[^>]+>", normalized) is None


def section_is_populated(text: str, heading: str, level: int = 2) -> bool:
    for line in section(text, heading, level=level).splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith(">") or stripped.startswith("|"):
            continue
        value = stripped.lstrip("-").strip()
        if ":" in value:
            value = value.split(":", 1)[1].strip()
        if is_populated(value):
            return True
    return False


def acceptance_criteria(text: str) -> list[tuple[str, str]]:
    criteria: list[tuple[str, str]] = []
    for line in section(text, "Acceptance Criteria").splitlines():
        match = CRITERION_RE.match(line.strip())
        if match:
            criteria.append((match.group(1), match.group(2).strip()))
    return criteria


def acceptance_evidence(text: str) -> list[tuple[str, str, str]]:
    block = section(text, "Acceptance Evidence", level=3)
    rows: list[tuple[str, str, str]] = []
    for line in block.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) != 3:
            continue
        if normalize(cells[0]) in {"criterion", "---"} or set(cells[0]) == {"-"}:
            continue
        rows.append((cells[0].strip("`"), normalize(cells[1]), cells[2]))
    return rows


def valid_revision(value: str) -> bool:
    normalized = normalize(value)
    return normalized == "no-code-change" or SHA_RE.fullmatch(normalized) is not None
