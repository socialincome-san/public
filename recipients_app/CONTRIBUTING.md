# Mobile App

The mobile app for recipients of a Social Income has currently three
goals. It lets recipients;

1. keep their personal data up-to-date
2. confirm monthly payments
3. fill out surveys for the impact measurement

The apps are build with Flutter and run on Android and iOS.

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Getting Started

Open `recipients_app` project folder in your development environment of
choice. Building flavor should work seamlessly for Android Studio and VS
Code with predefined build configs.

We have two build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
- `stage` -> Connecting with staging online firebase project and need
  real Firebase configuration json / plist file
- `prod` -> Connecting with production online firebase project and need
  real Firebase configuration json / plist file

For development use `dev` flavor.

As Firebase emulators work on your local host machine the easiest way to
run app is on the Android emulator. Real devices need some additional
setup.
