.PHONY: generate watch test clean get translations fontsize-smallest fontsize-regular fontsize-largest flavor-stage flavor-prod

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

translations:
	flutter gen-l10n

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

# After this initial running of "flutterfire configure", you need to re-run the command any time that you:
# - Start supporting a new platform in your Flutter app.
# - Start using a new Firebase service or product in your Flutter app, especially if you start using sign-in with Google, Crashlytics, Performance Monitoring, or Realtime Database.
# Re-running the command ensures that your Flutter app's Firebase configuration is up-to-date and (for Android) automatically adds any required Gradle plugins to your app.
