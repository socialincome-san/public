run-website:
	docker compose up ui

run-ui:
	docker compose up ui

build-ui:
	docker compose run --rm ui bash -c "npm run build:ui"