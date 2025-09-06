.PHONY: generate watch test translations firebase-android talkback fontsize

generate:
	fvm dart run build_runner build --delete-conflicting-outputs

watch:
	fvm dart run build_runner watch --delete-conflicting-outputs

test: 
	echo $(VAR)

clean:
	fvm flutter clean

get: 
	fvm flutter pub get

talkback:
	if adb shell settings get secure touch_exploration_enabled | grep -q "1"; then adb shell settings put secure enabled_accessibility_services "com.pleco.chinesesystem/com.pleco.chinesesystem.ScreenContentCaptureService"; adb shell settings put secure touch_exploration_enabled 0; echo "TalkBack OFF"; else adb shell settings put secure enabled_accessibility_services "com.pleco.chinesesystem/com.pleco.chinesesystem.ScreenContentCaptureService:com.samsung.android.accessibility.talkback/com.samsung.android.marvin.talkback.TalkBackService"; adb shell settings put secure accessibility_enabled 1; adb shell settings put secure touch_exploration_enabled 1; echo "TalkBack ON"; fi

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

appbundle-dev:
	fvm flutter build appbundle --flavor dev