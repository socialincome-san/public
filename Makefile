serve-website:
	docker compose up ui

serve-ui:
	docker compose up ui

build-ui:
	docker compose run --rm ui bash -c "npm i && npm run build:ui"