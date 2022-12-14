format-code:
	docker compose run --rm admin npm run format-code

admin-build:
	docker compose run --rm admin bash -c "npm install && npm run admin:build"

admin-serve:
	docker compose up admin

admin-test:
	docker compose run --rm admin bash -c "npm install && npm run admin:test"

functions-build:
	docker compose run --rm functions bash -c "npm install && npm run functions:build"

functions-serve:
	docker compose up functions

functions-test:
	docker compose run --no-deps --rm functions bash -c "npm install && npm run functions:test"

# build test "production" nextjs project using data from firebase emulator
website-build:
	docker compose run --rm website bash -c "npm install && npm run website:build:emulator"

# local dev server using firebase emulator
website-serve:
	docker compose up website

# run tests using firebase emulator
website-test:
	docker compose run --rm website bash -c "npm install && npm run website:test:emulator"

# updating translation files using the keys used in the code
website-extract-translations:
	docker compose run --rm website bash -c "npm run website:extract-translations"

firebase-serve:
	docker compose up firebase

firebase-export:
	docker compose exec firebase bash -c "npm run firebase:export"

survey-serve:
	docker compose up ui survey

survey-build:
	docker compose run --rm survey bash -c "npm ci && npm run survey:build"

ui-serve:
	docker compose up ui

ui-build:
	docker compose run --rm ui bash -c "npm ci && npm run ui:build"
