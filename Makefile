format-code:
	docker compose run --rm admin npm run format-code

admin-build:
	docker compose build admin

admin-serve:
	docker compose up admin

backend-serve:
	docker compose up backend

website-serve:
	docker compose up ui

ui-serve:
	docker compose up ui

ui-build:
	docker compose run --rm ui bash -c "npm ci && npm run build:ui"