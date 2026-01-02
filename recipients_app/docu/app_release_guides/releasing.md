# How to release the apps

1. Increment app version in pubspec.yaml. (Ignore build number. It is
   incremented automatically in CodeMagic)
   - Open 'pubspec.yaml' and increase 'version' with the desired app
     version. Example: Current: version: 1.1.12+0 New: version: 1.1.13+0
1. Run CodeMagic Build "iOS Staging (Firebase App Distribution)"
1. Run CodeMagic Build "Android Staging (Firebase App Distribution)"
1. Test the app on the Staging environment. See
   [manual test plans](../app_testing_guides/manual_test_plans.md).
1. If tests were ok, proceed with next step. Otherwise fix the bugs and
   start again at first step
1. Build the app for production:
   1. Run CodeMagic Build "iOS Production"
   1. Run CodeMagic Build "Android Production"
1. Add git tags with current app version and code
   - like "app-release-ios-1.1.13(30)" and
     "app-release-android-1.1.13(30)"
1. Create a new Apple App Store app version entry:
   - Login to [Appstore Connect](https://appstoreconnect.apple.com/apps)
   - Select app "Social Income"
   - Add new iOS app version
   - Check if we have to update some store data
   - Add "What's New in This Version?" text for all supported languages
   - Add the correct Build
   - Add the app version for Review
1. Create a new release on the "internal testing" track in the Google
   Play Console:
   - Login to [Google Play Console](https://play.google.com/console)
   - Select the production app
   - Go to "Release"->"Testing"->"Internal testing"
   - A new release should be already published in the Internal Test Track
   - Add release notes for all supported languages
   - Save and publish the release in the Internal Testing track
   - Do a quick smoke test of this app release
   - Promote the release to Production
   - Send the release to Production App Review
1. When both app reviews are approved by Apple and Google, release them
   into the stores
1. On the next day, adjust the remote config in Firebase with the new
   app version and set if it is an enforced update.
