# Mobile App

Mobile App for Recipients of a Social Income.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Getting Started

Open `recipients_app` project folder in your development environment of
choice. Building flavor should work seamlessly for Android Studio and VS
Code with predefined build configs.

We have two build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
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
flutter pub run build_runner watch --delete-conflicting-outputs