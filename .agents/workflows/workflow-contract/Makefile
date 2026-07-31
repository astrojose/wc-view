.PHONY: init init-dry validate validate-structure validate-metadata validate-readiness validate-scope validate-transitions validate-references check

init:
	python3 scripts/init_workflow_contract.py

init-dry:
	python3 scripts/init_workflow_contract.py --dry-run

validate:
	python3 scripts/validate_workflow.py

validate-structure:
	python3 scripts/validate_structure.py

validate-metadata:
	python3 scripts/validate_metadata.py

validate-readiness:
	python3 scripts/validate_readiness.py

validate-scope:
	python3 scripts/validate_scope_conflicts.py

validate-transitions:
	python3 scripts/validate_transitions.py

validate-references:
	python3 scripts/validate_references.py

check: init validate
