.PHONY: init init-dry validate validate-config validate-structure validate-metadata validate-readiness validate-scope validate-transitions validate-reconciliation validate-references test check

init:
	python3 scripts/init_workflow_contract.py

init-dry:
	python3 scripts/init_workflow_contract.py --dry-run

validate:
	python3 scripts/validate_workflow.py

validate-config:
	python3 scripts/validate_config.py

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

validate-reconciliation:
	python3 scripts/validate_reconciliation.py

validate-references:
	python3 scripts/validate_references.py

test:
	python3 -m unittest discover -s tests -p 'test_*.py'

check: init validate test
