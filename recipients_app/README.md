# Mobile App

Mobile App for Recipients of a Social Income.

## Tools needed for building the app on an Apple Silicon Mac

- [Homebrew](https://brew.sh/de/)
- Flutter (Version see file .tool-versions)
- Java JDK 17
- Android Studio LadyBug or later
- Latest vsCode
- Xcode 16.1

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
- Install Java 17 via Homebrew `brew install openjdk@17`
  - Homebrew is telling you to execute a symlink command, so that the
    system Java wrappers can find this JDK. Please do this.
  - Additionally in your USER's HOME directory in the file '.zshrc', add
    the lines to set the JAVA_HOME environment variable to Java 17 and
    add Java to the PATH environment variable
    ```shell
    export JAVA_HOME=$(/usr/libexec/java_home -v17)
    export PATH="$PATH:$JAVA_HOME/bin"
    ```
  - Restart your terminal so that these changes take effect
- Install Flutter
  - Tell Flutter to use our Java 17 JDK and not the one bundle with
    Android Studio via `flutter config --jdk-dir "$JAVA_HOME"`.
    Otherwise, you will get the error "Unsupported class file major
    version 65” when building the app for Android.
  - Restart your terminal and IDE so that these changes take effect
- Install vsCode
  - Install Flutter extension
- Install Xcode
  - Set is as default via `sudo xcode-select -s <path/to/>Xcode.app`
  - To agree to the Xcode license from the command line, you can use the
    following command: `sudo xcodebuild -license accept`
- Install CocoaPods
  - Install via Homebrew `brew install cocoapods`

## Optionally: Use the version manager [asdf](https://asdf-vm.com/)

- Install [asdf](https://asdf-vm.com/) via Homebrew with
  `brew install asdf`
- Install flutter plugin for asdf via `asdf plugin-add flutter`
- Add the following lines in your .zshrc file:
  ```shell
  export FLUTTER_ROOT="$(asdf where flutter)"
  ### asdf stuff ############
  source $(brew --prefix asdf)/libexec/asdf.sh
  export ASDF_NODEJS_LEGACY_FILE_DYNAMIC_STRATEGY=latest_available
  # This is optional. It installs tools defined in .tool-versions on terminal start
  asdf install
  ###########################
  ```

## Build and run the app the first time with vsCode

- Checkout main branch:
  `git clone https://github.com/socialincome-san/public.git ./social-income/`
- Copy file `./.vscode/launch.json.example` and rename it to
  `./.vscode/launch.json`
  - Replace the value "FILL IN SENTRY URL" after "SENTRY_URL=" with the
    real Sentry url to be able to use Sentry. If you do not prive a
    Sentry Url, no issues will be reported to Sentry but you can still
    run the app. To get the real Sentry url see
    [here](https://social-income.sentry.io/settings/projects/si-mobileapp/keys/)
    under "DSN".
  - Decide which flavor and backend environment you want to use and
    change it if necessary.
- Open `recipients_app` project folder in vsCode
- Open a terminal inside of vsCode and check `flutter --version` is
  listing the right flutter version (See above or pubspec.yaml).
- Add executable permissions to the script clean_build.sh via
  `chmod +x clean_build.sh`
- Run `./clean_build.sh`
- Choose in vsCode the device to deploy on (iOS Simulator, Android
  emulator, real Android or iOS device)
- Run the launch configuration "stage_recipients_app (debug mode)" to
  deploy and run the app on the selected devive in debug mode
- Happy testing!!

## Available app flavors

Building flavor should work seamlessly for Android Studio and VS Code
with predefined build configs.

We have three build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
- `stage` -> Connecting with staging online firebase project
- `prod` -> Connecting with production online firebase project and need
  real Firebase configuration json / plist file (not in the repo)

For development, use the `dev` or `stage` flavor.

As Firebase emulators work on your local host machine the easiest way to
run app is on the Android emulator. Real devices need some additional
setup.

## Communication Channel

1. Github for issue related discussion
2. Everything else on [Slack](https://social-income.slack.com/home)

## How tos

### Rebuilding JSON Serialization

```
dart run build_runner watch --delete-conflicting-outputs
```

or

```
dart run build_runner build --delete-conflicting-outputs
```

### Rebuilding Translations

Translations are stored in lib/l10n/app_en.arb. To rebuild the
translations after you changed something run:

```
flutter gen-l10n
```

To use a translated string in the code use:
`AppLocalizations.of(context).helloWorld` and import:
`import 'package:flutter_gen/gen_l10n/app_localizations.dart';`

### Upgrade flutter version

If you upgrade the flutter version, you have to change the following
locations as well:

- pubspec.yaml
  - Under 'environment' adjust the 'sdk' and 'flutter' versions
- .tool-versions (version file for version manager ASDF)
  - If you use 'asdf' run the comman `asdf local flutter x.y.z` #Replace
    x.y.z with the new Flutter version.
  - Otherwise just update the version number in the file

## Testing

### Manually

See [How to test](./docu/app_testing_guides/how_to_test.md)

### Run golden tests

Run `flutter test --update-golden` to update golden files.

## Releasing

See [How to release the app](./docu/app_release_guides/releasing.md)
