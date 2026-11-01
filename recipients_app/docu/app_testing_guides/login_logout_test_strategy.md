# Login and logout test strategy

## Recommendation

Use the tools already in the app for deterministic authentication-state tests:
`flutter_test`, `bloc_test`, and `mocktail`. Add Flutter's `integration_test`
package for device-level login and logout flows once the app can be bootstrapped
against local test services.

Do not use staging or production phone numbers, Firebase projects, App Check
tokens, or recipient data in automated tests.

## Why this needs two test levels

`AuthCubit` owns the app's authenticated state, recipient loading, logout, and
local-cache cleanup. These behaviors can be tested without a device by mocking
`AuthService`, `UserRepository`, `AppCacheDatabase`, and
`CrashReportingRepository`.

The visible login flow also calls `auth/request-otp` and `auth/verify-otp`
through `AuthenticatedClient`, then signs in with a Firebase custom token.
`AuthenticatedClient` obtains an App Check token for API calls. The Firebase
Auth emulator alone therefore cannot exercise the complete production login
flow: tests also need a local/test API response path and a test-safe App Check
configuration.

The repository already configures the Firebase Auth emulator on port `9099` in
the root `firebase.json`; the mobile app's current `runMainApp` composition
still initializes Firebase, App Check, and the HTTPS API client directly.

## Phase 1: AuthCubit unit tests

Create `test/core/cubits/auth/auth_cubit_test.dart` using the existing
`bloc_test` and `mocktail` dev dependencies.

Cover these behaviors:

1. A signed-in user causes the cubit to fetch a recipient and emit
   `AuthStatus.authenticated` with that recipient.
2. A null auth-state user emits `AuthStatus.unauthenticated`.
3. Logout signs out, clears the cache, and emits the unauthenticated state.
4. A sign-out or cache-clear failure emits `AuthStatus.failure` and is logged
   through `CrashReportingRepository`.
5. A recipient-fetch failure before any recipient is available emits failure;
   a network failure after cached recipient data does not discard that
   recipient.

These tests should use fake streams and repositories, not Firebase or network
services. They can run with the existing command:

```sh
cd recipients_app
fvm flutter test test/core/cubits/auth/auth_cubit_test.dart
```

## Phase 2: Device-level login/logout test

Add `integration_test` as an SDK dev dependency and create
`integration_test/auth_flow_test.dart`. Run it first on the Android emulator,
which is the repository's documented local Firebase-emulator environment.

Before this can be reliable, provide a test-only app bootstrap that:

1. Connects Firebase Auth to the local emulator before any auth operation.
2. Uses a local/test OTP API that returns deterministic test responses and
   issues custom tokens for the Auth emulator.
3. Avoids requesting App Check tokens for test API calls.
4. Supplies isolated recipient fixtures and local cache state.
5. Cannot silently fall back to the staging or production API.

Keep these settings out of the production entry points. Prefer injecting the
test API/auth dependencies at the app composition boundary over adding
environment-based production behavior.

The first device test should enter a known test phone and OTP, assert that the
dashboard appears after successful sign-in, log out from the account screen,
and assert that the unauthenticated welcome/login screen appears. Add negative
OTP and API-failure cases after the successful flow is stable.

Run a device test with:

```sh
cd recipients_app
fvm flutter test integration_test/auth_flow_test.dart -d <android-emulator-id>
```

## CI rollout

Keep Phase 1 in the existing mobile test command (`make run-tests`). Add Phase
2 to CI only after the test bootstrap and emulator startup are deterministic;
the job should start isolated Firebase/API emulators, use no production
secrets, and run on a pinned Android emulator image. The current repository
does not define a GitHub Actions job for mobile Flutter tests, so select its
CI location when the team chooses the mobile CI runner.

## References

- [Flutter integration testing](https://docs.flutter.dev/testing/integration-tests)
- [Firebase Authentication Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Flutter testing overview](https://docs.flutter.dev/testing/overview)
