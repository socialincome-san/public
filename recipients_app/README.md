# Mobile App

Mobile App for Recipients of a Social Income.

## Tools needed for building the app on an Apple Silicon Mac

- [Homebrew](https://brew.sh/de/)
- Java JDK 21
- Android Studio LadyBug or later
- Latest vscode
- Xcode 26.x

## Configure the Apple Silicon Mac environment to build our app

- Install [Homebrew](https://brew.sh/de/)
  ```shell
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- Install Android Studio
  - Set ANDROID_HOME and deprecated ANDROID_SDK_ROOT. Add the following
    lines in your USER's HOME directory in your .zshrc file:
    ```shell
    export ANDROID_HOME="YOUR PATH TO YOUR ANDROID SDK"
    export ANDROID_SDK_ROOT="$ANDROID_HOME" # ANDROID_SDK_ROOT is deprecated, but still in use
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"
    ```
  - Restart your terminal so that these changes take effect
- Install Xcode
  - Set is as default via `sudo xcode-select -s <path/to/>Xcode.app`
  - To agree to the Xcode license from the command line, you can use the
    following command: `sudo xcodebuild -license accept`
- Install vscode
  - Install Flutter extension
- Install [FVM (Flutter Version Manager)](https://fvm.app/)
  - Install it via `brew install fvm`
- Optional, but recommended: Pin Flutter's JDK version and do not use the JDK from
  Android Studio by default
  - Install Java 21 via Homebrew `brew install openjdk@21`
    - Homebrew is telling you to execute a symlink command, so that the
      system Java wrappers can find this JDK. Please do this.
    - Additionally in your USER's HOME directory in the file '.zshrc',
      add the lines to set the JAVA_HOME environment variable to Java 21
      and add Java to the PATH environment variable
      ```shell
      export JAVA_HOME=$(/usr/libexec/java_home -v21)
      export PATH="$PATH:$JAVA_HOME/bin"
      ```
    - Tell Flutter to use our Java 21 JDK and not the one bundle with Android Studio via `fvm flutter config --jdk-dir "$JAVA_HOME"`. Otherwise, you will get the error "Unsupported class file major version XX" when building the app for Android.
    - Restart your terminal and IDE so that these changes take effect

## Build and run the app the first time with vscode

- Checkout main branch:
  `git clone https://github.com/socialincome-san/public.git ./social-income/`
- Copy file `./.vscode/launch.json.example` and rename it to
  `./.vscode/launch.json`
  - Replace the value "FILL IN SENTRY URL" after "SENTRY_URL=" with the
    real Sentry url to be able to use Sentry. If you do not have a
    Sentry Url, no issues will be reported to Sentry but you can still
    run the app. To get the real Sentry url see
    [here](https://social-income.sentry.io/settings/projects/si-mobileapp/keys/)
    under "DSN".
  - Decide which flavor and backend environment you want to use and
    change it if necessary. (Normally we use "Stage" for development)
- Open `recipients_app` project folder in vscode
- Open a terminal inside of vscode and run `fvm install` to install our specified Flutter version from file `.fvmrc`
- Run `make clean-build`
- Run `dart pub global activate flutterfire_cli`
- Copy and rename the file "key.properties.example.debug" into
  "key.properties" to be able to sign the Android app for debugging.
- Run `make flavor-stage` -> choose "Build Configuration" -> Debug-stage
- Choose in vscode the device to deploy on (iOS Simulator, Android
  emulator, real Android or iOS device)
- Run the launch configuration "stage_recipients_app (debug mode)" to
  deploy and run the app on the selected device in debug mode
- Happy testing!!

### Important hint after we introduced Firebase AppCheck

After we introduced Firebase AppCheck, you will need to add a Firebase
App Check Debug Token to Firebase before you can access our Backend API
in Debug mode.

For this, you need to do the following:

**For iOS:**

1. Open ios/Runner.xcworkspace with Xcode and run your app. Your app
   will print a local debug token to the debug output when Firebase
   tries to send a request to the backend. For example:

```
Firebase App Check Debug Token:
123a4567-b89c-12d3-e456-789012345678
```

2. In the Firebase console, navigate to
   [`Security > App Check`](https://console.firebase.google.com/u/0/project/social-income-staging/appcheck/apps).
3. Register your debug token that you just logged. a. In the `Apps` tab,
   find the `iOS Stage` app. b. From your app's overflow menu, select
   `Manage debug tokens`. c. Follow the on-screen instructions to
   register your debug token.

**For Android:**

1. Run the Flutter app on an Android device. Your app will print a local
   debug token to the debug output when Firebase tries to send a request
   to the backend. For example:

```
D DebugAppCheckProvider: Enter this debug secret into the allow list in
the Firebase Console for your project: 123a4567-b89c-12d3-e456-789012345678
```

2. In the Firebase console, navigate to
   [`Security > App Check`](https://console.firebase.google.com/u/0/project/social-income-staging/appcheck/apps).
3. Register your debug token that you just logged. a. In the `Apps` tab,
   find the `Android Stage` app. b. From your app's overflow menu,
   select `Manage debug tokens`. c. Follow the on-screen instructions to
   register your debug token.

After you register the token, Firebase backend services will accept it
as valid. Because this token allows access to your Firebase resources
without a valid device, it is crucial that you keep it private. Don't
commit it to a public repository, and if a registered token is ever
compromised, revoke it immediately in the Firebase console.

Official documentation:
https://firebase.google.com/docs/app-check/flutter/debug-provider

### Important for Android release builds

After we introduced Firebase AppCheck, AppCheck will only work if you
install the app from the Google PlayStore. If you install the app from
CodeMagic or via another adhoc installation method, the app will throw
an app attestation error ([firebase_app_check/unknown] i1.j: Error
returned from API. code: 403 body: App attestation failed.).

[`For Google Play Integrity attestation to work, the app must be deployed to Google Play and subsequently downloaded from Google Play.`](https://github.com/firebase/flutterfire/issues/11117#issuecomment-1587172724)

## Available app flavors

Building flavor should work seamlessly for Android Studio and vscode
with predefined build configs. Info: To let Firebase work with flavors,
we followed this guide:
https://codewithandrea.com/articles/flutter-firebase-multiple-flavors-flutterfire-cli/

We have two build flavors:

- `stage` -> Connecting with staging online firebase project
- `prod` -> Connecting with production online firebase project and need
  real Firebase configuration json / plist file (not in the repo)

For development, use the `stage` flavor.

As Firebase emulators work on your local host machine the easiest way to
run app is on the Android emulator. Real devices need some additional
setup.

## Communication Channel

1. Github for issue related discussion
2. Everything else on [Slack](https://social-income.slack.com/home)

## How tos

### Rebuilding JSON Serialization

```
make watch
```

or

```
make generate
```

### Rebuilding Translations

Translations are stored in lib/l10n/app_en.arb. To rebuild the
translations after you changed something run:

```
make translations
```

To use a translated string in the code use: `context.l10n.helloWorld`
and import:
`import 'package:flutter_gen/gen_l10n/app_localizations.dart';`

### Upgrade flutter version

If you upgrade the flutter version, you have to change the following
locations as well:

- pubspec.yaml
  - Under 'environment' adjust the 'sdk' and 'flutter' versions
- .fvmrc (version file for Flutter version manager FVM)
  - If you use 'FVM' run the command `fvm use x.y.z` #Replace
    x.y.z with the new Flutter version.
  - Otherwise just update the version number in the file with the text
    editor and restart the terminal and IDE. Then run `fvm install` to install the new flutter version.
- Update also dependent tool versions like Xcode, Java, etc. 
  Update versions at "env_versions" in codemagic.yaml

## CI/CD Pipelines

We use CodeMagic to build our apps. The pipeline/workflows to build and
release the apps are define in the file codemagic.yaml.

CodeMagic documentation:
https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/
CodeMagic Cheetsheet:
https://docs.codemagic.io/codemagic-yaml-cheatsheet.html

## SI authentication backend API

We have the two authentication APIs to log in the user via its phone
number. For that the phone number is first verified via OTP and on
success the user is signed in. The following APIs are involved in this
sign in process:

- api/v1/auth/request-otp
- api/v1/auth/verify-otp

This two APIs are secured via Firebase AppCheck, so that only authorized
callers can use the APIs.

If you want to sign in via debugging, you need to do the following:

- Run the app in debug mode on your device or simulator/emulator
  - For Android you can run the app from vscode and check the logs there
  - For iOS you **need** to start the app **via Xcode** and the **scheme
    "stage"** and check the logs there. You will not see the token in
    the vscode debug console.
- In the logs look for "Firebase App Check Debug Token" on iOS or
  "DebugAppCheckProvider" on Android.
- Copy the debug token/secret
- In the App Check section of the Firebase console, select either "iOS
  Stage" or "Android Stage". Then choose "Manage debug tokens" from the
  app's overflow menu. Then, register the debug token from the previous
  step.
- After you register the token, Firebase backend services will accept it
  as valid.

Because this token allows access to your Firebase resources without a
valid device, it is crucial that you keep it private. Don't commit it to
a public repository, and if a registered token is ever compromised,
revoke it immediately in the Firebase console.

See the
[official Firebase documentation](https://firebase.google.com/docs/app-check/flutter/debug-provider)
for more details.

## Testing

### Manually

See [How to test](./docu/app_testing_guides/how_to_test.md)

### Golden tests

- Run `make run-tests` to run all tests incl. all golden tests.
- Run `make update-tests` to update golden files.

## Releasing

See [How to release the app](./docu/app_release_guides/releasing.md)
