format-code:
	docker compose run --rm admin npm run format-code

build-admin:
	docker compose build admin

serve-admin:
	docker compose up admin

serve-website:
	docker compose up ui

serve-ui:
	docker compose up ui

build-ui:
	docker compose run --rm ui bash -c "npm ci && npm run build:ui"