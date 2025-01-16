# Test environments

## Available testing stages

We have three testing stages:

- DEV
- STAGING
- PROD

## Test in Stage “DEV”

The stage DEV is for feature development and bug fixing on the local
development machine.

### App Name is: Dev Social Income

### Available Backends:

There is no Firebase Project for this stage. To test the app while
developing, we use the Firebase emulator. The emulator works on your
local host machine; the easiest way to run the app is on the Android
emulator. Real devices need some additional setup.

But you can also use the Firebase Staging Backend to test your local
stuff. See Firebase Staging Project and Admin Staging Tool

## Test in Stage “STAGING”

### App Name is: Stage Social Income

Login Credentials: Either use these
[test accounts](https://docs.google.com/document/d/1-y__kbnLX3KCHp2pdXhzq58rbMmnXwUI-Cirihy224o/edit?pli=1#heading=h.4a9qjbxltxku)
or your mobile number on file in the recipients list in the
[Admin Staging Tool](https://console.firebase.google.com/u/1/project/social-income-staging/overview)

### iOS Platform

Install the app either from Firebase App Distribution (Invitation
needed) or TestFlight (Invitation needed on App Store Connect).

App Distribution Installation instructions: Open email from Firebase App
Distribution, accept invitation with Google account, enable installation
of profile, use Firebase App Distribution to download latest Stage
Social Income. Troubleshoot: Tester Instruction by Firebase App
Distribution

### Android Platform

Install the app either from Firebase App Distribution (Invitation link
click here) or from Google Play Store Console. For this you have to be
added as a tester (request access).

App Distribution Installation instructions: Open email from Firebase App
Distribution, accept invitation with Google account, enable installation
from unknown sources, use Firebase App Distribution to download latest
Stage Social Income. Troubleshoot: Tester Instruction by Firebase App
Distribution

### Backend for Stage STAGING

The Staging App uses the Firebase Staging Backend. See Firebase Staging
Project (only for admins) and Admin Staging Tool (request access).

## Test in Stage “PROD”

### App Name is: Social Income

### Requirements:

Login Credentials: You need to have your phone number added in the
recipients list (with the flag test) on Admin Prod Tool (only for core
developers)

### iOS Platform

Install the app via Testflight: You need to be authorized on TestFlight
(ask core developers to be added)

### Android Platform

Install Android: You need to be a tester on the internal track on Google
Play Console (ask core developers to be added)

### Backend for Stage PROD

The Prod App uses the Firebase Prod Backend. See Firebase Prod Project
and Admin Prod Tool (request access).
