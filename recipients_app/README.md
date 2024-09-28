# Mobile App

Mobile App for Recipients of a Social Income.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Getting Started

Open `recipients_app` project folder in your development environment of
choice. Building flavor should work seamlessly for Android Studio and VS
Code with predefined build configs.

We have three build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
- `stage` -> Connecting with staging online firebase project
- `prod` -> Connecting with production online firebase project and need
  real Firebase configuration json / plist file

For development use `dev` flavor.

As Firebase emulators work on your local host machine the easiest way to
run app is on the Android emulator. Real devices need some additional
setup.

## Communication Channel

1. Github for issue related discussion
2. Everything else on [Slack](https://social-income.slack.com/home)

## Rebuilding JSON Serialization

```
dart run build_runner watch --delete-conflicting-outputs
```

or

```
dart run build_runner build --delete-conflicting-outputs
```

## Rebuilding Translations

Translations are stored in lib/l10n/app_en.arb. To rebuild the
translations after you changed something run:

```
flutter gen-l10n
```

To use a translated string in the code use:
`AppLocalizations.of(context).helloWorld` and import:
`import 'package:flutter_gen/gen_l10n/app_localizations.dart';`

## Testing

### Manually

See [How to test](./docu/app_testing_guides/how_to_test.md)

### Run golden tests

Run `flutter test --update-golden` to update golden files.

## Releasing

See [How to release the app](./docu/app_release_guides/releasing.md)
