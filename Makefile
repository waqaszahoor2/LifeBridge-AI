.PHONY: setup backend worker web test validate train refresh docker-up docker-full docker-down

setup:
	python scripts/generate_secrets.py || true
	python -m venv apps/backend/.venv
	apps/backend/.venv/bin/pip install -r apps/backend/requirements.txt -r apps/backend/requirements-dev.txt
	cd apps/web && npm install

backend:
	cd apps/backend && uvicorn app.main:app --reload --port 8000

worker:
	cd apps/backend && python -m app.worker

web:
	cd apps/web && npm run dev

test:
	cd apps/backend && pytest
	python scripts/validate_project.py
	cd apps/web && npm run lint && npm run build

validate:
	python scripts/validate_project.py

train:
	python ml/scripts/train_all.py

refresh:
	python scripts/refresh_sources.py

docker-up:
	docker compose up --build

docker-full:
	docker compose --profile full up --build

docker-down:
	docker compose down
