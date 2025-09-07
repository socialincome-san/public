.PHONY: generate watch test translations firebase-android talkback fontsize

generate:
	dart run build_runner build --delete-conflicting-outputs

watch:
	dart run build_runner watch --delete-conflicting-outputs

test: 
	echo $(VAR)

clean:
	flutter clean

get: 
	flutter pub get

fontsize-smallest:
	adb shell settings put system font_scale 0.8

fontsize-regular:
	adb shell settings put system font_scale 1.0

fontsize-largest:
	adb shell settings put system font_scale 1.3

flavor-stage:
	flutterfire config --project=social-income-staging --out=lib/firebase_options_stage.dart --ios-bundle-id=org.socialincome.app.stage  --ios-out=ios/flavors/stage/GoogleService-Info.plist  --android-package-name=org.socialincome.app.stage  --android-out=android/app/src/stage/google-services.json

flavor-prod:
	flutterfire config --project=social-income-prod --out=lib/firebase_options_prod.dart --ios-bundle-id=org.socialincome.app  --ios-out=ios/flavors/prod/GoogleService-Info.plist  --android-package-name=org.socialincome.app  --android-out=android/app/src/prod/google-services.json