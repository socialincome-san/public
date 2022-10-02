format-code:
	docker compose run --rm admin npm run format-code

admin-build:
	docker compose build admin

admin-serve:
	docker compose up admin

backend-serve:
	docker compose up backend

backend-test:
	docker compose run --rm backend bash -c "npm --workspace @socialincome/backend install && npm run backend:test"

website-serve:
	docker compose up ui

ui-serve:
	docker compose up ui

ui-build:
	docker compose run --rm ui bash -c "npm ci && npm run ui:build"