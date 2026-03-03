# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flutter mobile app for recipients of Social Income. It allows recipients to:
1. Keep their personal data up-to-date
2. Confirm monthly payments
3. Fill out surveys for impact measurement

The app runs on Android and iOS, uses Firebase for backend services, and communicates with a custom Social Income API.

## Development Commands

### Setup & Configuration
```bash
# First-time setup after cloning
make get                    # Install dependencies
make flavor-stage          # Configure Firebase for staging environment
make flavor-prod           # Configure Firebase for production environment

# Clean build (when dependencies are misbehaving)
./clean_build.sh           # Runs flutter clean, pub get, and pod install
```

### Code Generation
```bash
# JSON serialization (after changing models with @MappableClass)
make generate              # One-time build
make watch                 # Watch mode for development

# Translations (after changing lib/l10n/app_en.arb)
make translations          # Generate localization files
```

### Testing
```bash
flutter test               # Run all tests including golden tests
flutter test --update-goldens  # Update golden test images
flutter test path/to/test_file.dart  # Run specific test file
```

### Running the App
The app uses VSCode launch configurations. Copy `.vscode/launch.json.example` to `.vscode/launch.json` and configure:
- `BASE_URL`: Set to `staging.socialincome.org` for development
- `SENTRY_URL`: Optional, get from Firebase console if needed

Use the launch configurations:
- "stage_recipients_app (debug mode)" - Normal development
- "stage_recipients_app (profile mode)" - Performance testing
- "stage_recipients_app (release mode)" - Production-like testing

### Build & Linting
```bash
flutter analyze            # Run static analysis
flutter build apk --flavor stage  # Build Android APK
flutter build ios --flavor stage  # Build iOS app
```

## Code Architecture

### Architecture Pattern: BLoC
The app uses the **BLoC pattern** via `flutter_bloc` package:
- **Cubits** (simplified BLoCs) manage feature-specific state
- **Repository Pattern** for data access abstraction
- **Dependency Injection** via RepositoryProvider and BlocProvider
- **Stream-based** reactive updates for UI

### Directory Structure

```
lib/
├── core/                    # Business logic layer
│   ├── cubits/             # State management (AuthCubit, PayoutsCubit, etc.)
│   └── helpers/            # Utilities, extensions, observers
├── data/                   # Data layer
│   ├── datasource/         # Abstract interfaces + implementations
│   │   ├── demo/           # Mock data for testing
│   │   └── remote/         # Real API implementations
│   ├── models/             # Data models with dart_mappable
│   ├── repositories/       # Repository pattern implementations
│   ├── services/           # Domain services (auth, config, etc.)
│   └── enums/              # Shared enumerations
├── ui/                     # Reusable UI components
│   ├── buttons/            # Button components
│   ├── configs/            # Theme, colors, styles, sizes
│   ├── icons/              # Icon components
│   ├── inputs/             # Form inputs
│   └── navigation/         # Navigation keys
├── view/                   # Feature-specific UI
│   ├── pages/              # Full screen pages
│   └── widgets/            # Feature widgets (account, income, survey, etc.)
└── l10n/                   # Internationalization (English + Krio)
```

### Data Flow Pattern

```
User Action → Cubit → Repository → DataSource → AuthenticatedClient → API
                ↓
            State Update
                ↓
          UI Re-renders (BlocBuilder)
```

### Key Architectural Components

**Authentication Flow:**
1. Phone number entry → `SignupCubit.signupWithPhoneNumber()`
2. OTP request → API `/auth/request-otp` (secured by Firebase App Check)
3. OTP verification → API `/auth/verify-otp` returns custom token
4. Firebase sign-in → `AuthService.signInWith()` uses custom token
5. Recipient fetch → `UserRepository.fetchRecipient()` gets user data
6. Auth state → `AuthCubit` manages authentication state globally

**HTTP Client (`AuthenticatedClient`):**
- Extends `http.BaseClient` (lib/data/services/authenticated_client.dart)
- Automatically injects three headers on all requests:
  - `Content-Type: application/json`
  - `Authorization: Bearer <Firebase ID Token>`
  - `X-Firebase-AppCheck: <App Check Token>`
- Configured via `BASE_URL` environment variable
- 30-second timeout on all requests
- Throws custom `AuthException` if app check token generation fails

**Demo Mode:**
- `DemoManager` singleton toggles between real and mock data
- DataSource pattern: Each feature has an abstract DataSource interface with two implementations:
  - `RemoteDataSource` - Calls actual API via `AuthenticatedClient`
  - `DemoDataSource` - Returns hardcoded mock data
- Repositories check `DemoManager.isDemoEnabled` to select DataSource
- `AuthService.authStateChanges()` emits fake demo user when enabled
- Switch seamlessly without app restart - useful for UI testing and demos

**Code Generation:**
- Uses `dart_mappable` for JSON serialization
- Models annotated with `@MappableClass` generate `.mapper.dart` files
- Run `make generate` after model changes

**Dependency Injection:**
- All dependencies injected at app root in `MyApp.build()`
- `MultiRepositoryProvider` for repositories
- `MultiBlocProvider` for cubits
- Services (AuthService, RemoteConfigService) instantiated in `main.dart`

**Firebase Integration:**
- **Firebase Auth** - Phone number authentication with custom tokens
- **Firebase App Check** - API security (Play Integrity on Android, App Attest on iOS)
- **Firebase Messaging** - Push notifications
- **Firebase Remote Config** - Feature flags and minimum version enforcement
- **Sentry** - Error tracking and crash reporting

**Offline Caching:**
- **Drift Database** - SQLite-based local storage for offline access
- **Cache-First Strategy** - Shows cached data immediately, refreshes in background
- **ConnectivityCubit** - Monitors network state and controls offline banner
- **OfflineBanner** - Global UI indicator when network is unavailable
- Three cached entities: Recipients, Payouts, Surveys
- Local DataSource implementations mirror Remote DataSource pattern
- Caching bypassed in demo mode to preserve mock data behavior

### Offline Caching Architecture

The app implements a **cache-first strategy** using Drift (SQLite) for local persistence. This ensures users can view their data even without internet connectivity.

**Core Principle: Cache-First Flow**
```
1. Repository checks local cache first
2. Emits cached data immediately (if available)
3. Fetches fresh data from API in background
4. Updates local cache on success
5. Calls onFreshData() callback to update UI
6. On network failure: returns cached data or throws
```

**Database Schema (lib/data/database/app_database.dart):**
Three tables store cached data:
- `Recipients` - Full Recipient JSON in `recipientJson` column (TEXT), keyed by `id`
- `Payouts` - Flat payout records, filtered by `recipientId`
- `Surveys` - Survey records with JSON columns for `questionnaire` and `data`

All tables include `cachedAt` timestamp (DateTime) for TTL management.

**Local DataSource Pattern:**
Each data type has a Local DataSource implementation:
- `UserLocalDataSource` (lib/data/datasource/local/user_local_data_source.dart)
- `PayoutLocalDataSource` (lib/data/datasource/local/payout_local_data_source.dart)
- `SurveyLocalDataSource` (lib/data/datasource/local/survey_local_data_source.dart)

These implement the same interface as Remote/Demo DataSources but read/write to Drift database.

**Repository Cache Logic:**
All repositories follow this pattern:
```dart
Future<void> fetchData({Function(T) onData}) async {
  T? cachedData;

  // 1. Try cache first (skip in demo mode)
  try {
    cachedData = await localDataSource.fetch();
    if(cachedData){
      onData(cachedData)
    }
  } catch (e) {
    // Cache miss is acceptable
  }

  // 2. Fetch fresh data in background
  try {
    final freshData = await _activeDataSource.fetch();

    // 3. Update cache
    if (freshData != null) {
      await localDataSource.save(freshData);
    }

    // 4. Notify UI if data changed
    if (freshData != cachedData) {
      onData(freshData);
    }

    // 5. Handle case where both fresh and cached are null - still notify with null
    if (freshData == null && cachedData == null) {
      onData(null);
    }
  } catch (e) {
    rethrow;
  }
}
```

**Connectivity Tracking:**
- `ConnectivityCubit` (lib/core/cubits/connectivity/connectivity_cubit.dart) wraps `connectivity_plus` package
- Emits `ConnectivityState(isOnline: bool, isInitialized: bool)`
- Listens to network state changes (WiFi, mobile, none)
- Initialized at app startup in `MyApp` providers

**Offline Banner:**
- `OfflineBanner` widget (lib/view/widgets/offline_banner.dart) wraps entire app
- Displays red banner at top when `ConnectivityCubit.isOnline == false`
- Message: "You are offline. Showing cached data."
- AnimatedContainer with height transition (0px online, 40px offline)
- Positioned in `my_app.dart` below `AppUpdateCheckWidget`

**Cubit Integration:**
Cubits use `onFreshData` callbacks to handle background refresh:
```dart
// In AuthCubit, PayoutsCubit, SurveyCubit
final data = await repository.fetchData(
  onFreshData: (freshData) {
    // Update UI when fresh data arrives
    emit(state.copyWith(data: freshData));
  },
);
// Initial emit with cached data (if available)
emit(state.copyWith(data: data));
```

**Cache Lifecycle:**
- Cache populated on first successful API fetch
- Cache updated on every subsequent successful fetch
- Cache cleared on logout: `UserRepository.clearCache()`
- Demo mode also use caching logic

**Testing Offline Functionality:**
1. Run app with internet, let data load and cache
2. Enable airplane mode or disable network
3. Verify offline banner appears at top
4. Kill and restart app
5. Verify cached data loads immediately
6. Re-enable network
7. Verify banner disappears and data refreshes

**Edge Cases Handled:**
- Corrupted cache: Try-catch in cache read, falls back to network
- Cache miss: Network-only fetch on first app launch
- Write operations offline: Now handled by update queue system (see below)
- Demo mode: Also demo mode data is cached.

### Update Queue System

The app implements a **persistent queue system** for all data update operations (payments, user profile, etc.). This ensures updates never get lost, even when offline or if the app crashes mid-operation.

**Core Principle: Queue All Updates**
```
User Action → Cubit → QueueAwareRepository → UpdateQueueService.enqueue()
                                                        ↓
                                              Drift UpdateQueue table
                                                        ↓
                                    When online: processQueue() sequentially
                                                        ↓
                                    Execute via base Repository → API
                                                        ↓
                                    Success: Show Flushbar + refresh data
                                    Failure: Retry (max 3x) or mark failed
```

**Database Schema:**
The `UpdateQueue` table (schema version 2) stores pending operations:
- `id` - Auto-increment primary key
- `operationType` - Operation type string (confirm_payment, update_recipient, etc.)
- `operationPayload` - JSON serialized operation parameters
- `createdAt` - Timestamp when queued
- `retryCount` - Number of retry attempts (max 3)
- `status` - Current status (pending/processing/failed)
- `error` - Error message if failed

**Queue Operation Models:**
All operations extend `QueuedOperation` base class (lib/data/models/queue/queue_operations.dart):
- `ConfirmPaymentOperation(payoutId)`
- `ContestPaymentOperation(payoutId, contestReason)`
- `UpdateRecipientOperation(selfUpdate)`
- `UpdatePaymentNumberOperation(...)` - TODO: not yet implemented
- `UpdateContactNumberOperation(...)` - TODO: not yet implemented

Operations use `@MappableClass` for JSON serialization to/from queue table.

**UpdateQueueService:**
Central service (lib/data/services/update_queue_service.dart) manages queue lifecycle:

Key methods:
- `enqueue(QueuedOperation)` - Add operation to queue, auto-start processing if online
- `processQueue()` - Process all pending operations sequentially (single-threaded)
- `getPendingCount()` - Get count of pending operations (for badge)
- `getAllOperations()` - Get all operations for debug UI

Event streams:
- `events` - Broadcasts `QueueSuccessEvent` and `QueueErrorEvent` for UI notifications
- `pendingCountStream` - Real-time count of pending operations

Auto-resume on connectivity:
- Listens to `ConnectivityCubit.stream`
- Automatically calls `processQueue()` when connection restored
- Preserves queue across app restarts (persistent in Drift)

**Queue-Aware Repository Pattern:**
Decorator pattern wraps existing repositories to queue update operations:
- `QueueAwarePaymentRepository` - Wraps `PaymentRepository`
- `QueueAwareUserRepository` - Wraps `UserRepository`

These extend base repositories but override update methods:
```dart
@override
Future<void> confirmPayment({required String payoutId}) async {
  // Queue instead of executing directly
  await _queueService.enqueue(
    ConfirmPaymentOperation(payoutId: payoutId)
  );
}
```

Read operations (fetchPayouts, fetchRecipient) are inherited unchanged.

**Dependency Injection:**
In main.dart:
1. Create base repositories (UserRepository, PaymentRepository)
2. Create ConnectivityCubit and initialize
3. Create UpdateQueueService (requires base repos + connectivity + database)
4. Create queue-aware wrappers (requires base repo dependencies + queue service)
5. Pass queue-aware wrappers to MyApp instead of base repositories

**Cubit Integration:**
Cubits emit `queued` status after enqueueing operations:
- `PayoutsStatus.queued` - After calling confirmPayment/contestPayment
- `AuthStatus.updateRecipientQueued` - After calling updateRecipient

The actual update and data refresh happens later via QueueEventListener.

**QueueEventListener:**
Global widget (lib/view/widgets/queue_event_listener.dart) wraps MaterialApp:
- Listens to `UpdateQueueService.events` stream
- On `QueueSuccessEvent`: Shows success Flushbar + triggers data refresh
- On `QueueErrorEvent`: Shows error Flushbar
- Refresh logic:
  - Payment operations → `PayoutsCubit.loadPayments()`
  - Recipient operations → `AuthCubit.init()`

**Queue Badge:**
Widget (lib/view/widgets/queue_badge.dart) displays pending operation count:
- Listens to `UpdateQueueService.pendingCountStream`
- Shows badge with sync icon + count (e.g., "2 pending")
- Hidden when count is 0
- Can be placed in app bar or as floating widget

**Debug Queue Page:**
Full-screen debug UI (lib/view/pages/debug_queue_page.dart):
- Only accessible in `kDebugMode`
- Shows all queue operations with full details:
  - Operation type, status, created time
  - Retry count, error message
  - Color-coded status badges
- Refresh button to reload queue state
- Useful for debugging queue issues

**Retry Logic:**
- Max 3 retry attempts per operation
- On failure: Increment retryCount, mark as pending for retry
- After 3 failures: Mark as failed, emit error event, keep in database
- Error logged to CrashReportingRepository (Sentry)

**Success Flow:**
1. Operation succeeds → Remove from queue
2. Emit `QueueSuccessEvent` with success message
3. QueueEventListener shows Flushbar notification
4. QueueEventListener triggers data refresh in appropriate Cubit
5. Update `pendingCountStream` for badge

**User Experience:**
- **Optimistic UI**: Cubits emit "queued" status immediately
- **Offline support**: Queue persists operations when offline
- **Auto-resume**: Processing resumes automatically when back online
- **Success notifications**: User sees Flushbar when each operation completes
- **Pending indicator**: Badge shows count of pending operations
- **No data loss**: Operations survive app crashes and restarts

**Testing Queue Flow:**
1. Perform update operation (confirm payment, update profile)
2. Verify Cubit emits queued status
3. Verify operation appears in queue (check badge count or debug page)
4. If online: Verify operation processes and success Flushbar appears
5. If offline: Enable airplane mode, perform operation, verify it queues
6. Re-enable network, verify operation auto-processes
7. Check debug queue page to see operation history

**Edge Cases Handled:**
- App crash during processing: Operation stays in queue, retries on restart
- Network failure mid-operation: Retries up to 3 times
- Multiple updates to same entity: All queued separately, processed sequentially
- Logout: Queue persists (TODO: may want to clear queue on logout in future)
- Demo mode: Queue still active (TODO: may want to bypass queue in demo mode)

### Important Architectural Patterns

**Cubit State Pattern:**
All Cubit states follow a consistent pattern:
- Annotated with `@MappableClass()` for code generation
- Include a `status` enum field (e.g., `AuthStatus`, `PayoutsStatus`)
- Optional `exception` field for error states
- Generated `.mapper.dart` files provide `copyWith()` method

Standard emission pattern in Cubits:
```dart
Future<void> someAction() async {
  emit(state.copyWith(status: SomeStatus.loading));
  try {
    final result = await repository.doSomething();
    emit(state.copyWith(status: SomeStatus.success, data: result));
  } catch (ex, stackTrace) {
    crashReportingRepository.logError(ex, stackTrace);
    emit(state.copyWith(status: SomeStatus.failure, exception: ex));
  }
}
```

**Error Handling Pattern:**
- `ErrorLocalizationHelper` (lib/view/error_localization_helper.dart) centralizes error mapping
- Maps 100+ Firebase/Cloud Functions error codes to localized user messages
- Cubits catch exceptions and log via `CrashReportingRepository`
- `FlushbarHelper` displays user-friendly notifications (4 types: success, error, warning, info)
- Auto-dismiss based on type (3-5 seconds)

**Navigation Pattern:**
- Simple `Navigator.push()` with `MaterialPageRoute` (no router packages)
- Root navigation key in `lib/ui/navigation/app_navigation_keys.dart`
- Authentication-based routing in `MyApp` using `BlocConsumer<AuthCubit>`:
  - `unauthenticated` → `WelcomePage`
  - `authenticated` + terms not accepted → `TermsAndConditionsPage`
  - `authenticated` + terms accepted → `MainAppPage`
  - `authenticatedWithoutRecipient` → Sign out and show error

**API Response Handling Pattern:**
Standard pattern in RemoteDataSource implementations:
1. Check `response.statusCode != 200` (or 204 for no-content)
2. Throw descriptive Exception with status code if failed
3. Parse single object: `ModelMapper.fromJson(response.body)`
4. Parse list: `jsonDecode()` first, then `ModelMapper.fromMap()` on each item

**Environment Variables:**
Build-time configuration using `String.fromEnvironment()`:
- `FLUTTER_APP_FLAVOR` - Required (stage/prod)
- `BASE_URL` - API base URL (e.g., "staging.socialincome.org")
- `SENTRY_URL` - Sentry DSN for crash reporting

Set via launch.json `--dart-define` arguments, not runtime .env files.

**Demo Mode Architecture:**
- `DemoManager` singleton with broadcast stream
- When enabled, all repositories switch from Remote to Demo DataSource
- `AuthService.authStateChanges()` emits fake demo user
- Seamless toggle without app restart
- Useful for UI testing and demos without backend

**Payment Confirmation Flow:**
- Payment statuses form a state machine with 8 states (lib/data/enums/payout_ui_status.dart)
- "On Hold" logic: Multiple unconfirmed payments that aren't recent (>10 days old)
- Two-step contest flow: Select reason, then provide description if "other"
- Balance card aggregates payment states into hierarchy: onHold > recentToReview > needsAttention > allConfirmed

**Survey Flow:**
- Date-based visibility: Show 10 days before due date until 20 days after
- Survey status changes based on days relative to due date
- 6 statuses: `newSurvey`, `firstReminder`, `overdue`, `missed`, `answered`, `upcoming`
- Embedded WebView displays survey with pre-filled auth params in URL

**Force Update Mechanism:**
- `force_update_helper` package wraps entire app
- Version info fetched from Firebase Remote Config (`app_version_info`)
- Platform-specific dialogs (Cupertino/Material)
- Can be optional or forced update based on config

**Push Notifications:**
Three handler functions required for Firebase Cloud Messaging:
- `_handleForegroundMessage` - App is open
- `_handleBackgroundMessage` - App is backgrounded
- `_firebaseMessagingBackgroundHandler` - App is terminated (requires `@pragma("vm:entry-point")`)
- Initialized in `SettingsCubit.initMessaging()`
- Current implementation logs but doesn't display (incomplete)

**BlocObserver for Debugging:**
- `CustomBlocObserver` (lib/core/helpers/custom_bloc_observer.dart) logs all Bloc/Cubit lifecycle events
- Logs onCreate, onChange, onError, onClose with runtime type and hash code
- Useful for debugging state transitions

### App Flavors

The app has two flavors (stage and prod):
- **stage** - Uses staging Firebase project and `staging.socialincome.org` API
- **prod** - Uses production Firebase project and production API

Each flavor has:
- Separate entry point: `main_stage.dart`, `main_prod.dart`
- Firebase config: `firebase_options_stage.dart`, `firebase_options_prod.dart`
- Android build variant: `android/app/src/stage/`, `android/app/src/prod/`
- iOS scheme and bundle ID

**Always use the `stage` flavor for development.**

## Important Conventions

### Code Style
- Line length: 120 characters (configured in `.vscode/settings.json`)
- Follow `analysis_options.yaml` rules (using `lint` package)
- Use `dart format` before committing

### State Management
- One Cubit per feature/domain
- Emit specific state classes (not generic states)
- Handle errors in Cubit methods with try-catch
- Log errors to `CrashReportingRepository` for Sentry

### Error Handling
- Catch exceptions in Cubit methods
- Show user-friendly errors via `FlushbarHelper`
- Log to Sentry via `CrashReportingRepository`

### Localization
- Add strings to `lib/l10n/app_en.arb` (English is source)
- Run `make translations` to generate code
- Use in code: `context.l10n.stringKey`
- Import: `import 'package:flutter_gen/gen_l10n/app_localizations.dart';`
- Supported languages: English (en), Krio (kri)

### Testing
- **Golden tests** for widgets in `test/golden_tests/`
- **Alchemist** package for golden test framework with device scenarios
- **Test helpers** in `test/helpers/`:
  - `pump_app.dart` - Extension on `WidgetTester` with `pumpApp()` to wrap widgets in providers
  - `device.dart` - Device configurations (iPhone, Android, various sizes)
  - `golden_test_device_scenario.dart` - Test scenarios for different devices
  - `flutter_test_config.dart` - Global test configuration
- **Mocking**:
  - `bloc_test` for Cubit testing with `MockCubit`
  - `mocktail` for general mocking
  - Demo data sources in `lib/data/datasource/demo/` for integration testing

## Firebase App Check Debugging

The authentication APIs (`/auth/request-otp`, `/auth/verify-otp`) are secured by Firebase App Check. To test in debug mode:

1. Run app in debug mode
2. Find debug token in logs:
   - **iOS**: Must run via Xcode with "stage" scheme (not visible in VSCode)
   - **Android**: Check VSCode debug console or logcat
3. Register token in Firebase Console:
   - Go to App Check section
   - Select "iOS Stage" or "Android Stage"
   - Choose "Manage debug tokens"
   - Add the token
4. Token allows API access - keep it private, never commit it

See [Firebase App Check docs](https://firebase.google.com/docs/app-check/flutter/debug-provider) for details.

## Common Tasks

### Adding a New Feature
1. Create Cubit in `lib/core/cubits/feature_name/`
2. Define state classes with `@MappableClass`
3. Create repository in `lib/data/repositories/`
4. Create data source interfaces and implementations
5. Add models in `lib/data/models/`
6. Run `make generate` to build serialization code
7. Add UI in `lib/view/pages/` or `lib/view/widgets/`
8. Inject Cubit and Repository in `MyApp` providers
9. Write golden tests if UI is complex

### Updating API Models
1. Modify model class in `lib/data/models/`
2. Run `make watch` (auto-regenerates on save)
3. Update related repository/data source methods
4. Update any affected Cubits
5. Test changes with demo mode first

### Adding a Translation
1. Add key-value to `lib/l10n/app_en.arb`
2. Add Krio translation to `lib/l10n/app_kri.arb`
3. Run `make translations`
4. Use in code: `context.l10n.yourNewKey`

### Debugging Authentication Issues
1. Check Firebase Auth state in `AuthCubit`
2. Verify App Check token is valid (see debugging section above)
3. Check API responses in `AuthenticatedClient` logs
4. Verify `BASE_URL` in launch.json matches environment
5. Test with demo mode to isolate UI vs API issues

### Working with Offline Caching
**Viewing Cached Data:**
- Database file: `Application Documents Directory/social_income.db`
- Use Drift DevTools or SQLite browser to inspect cache
- Check `cachedAt` timestamps to verify cache freshness

**Modifying Cache Logic:**
1. Update repository method in `lib/data/repositories/`
2. Ensure `onFreshData` callback is called when fresh data differs from cache
3. Test both online and offline scenarios

**Adding New Cached Entity:**
1. Add table to `lib/data/database/app_database.dart`
2. Run `dart run build_runner build --delete-conflicting-outputs`
3. Create LocalDataSource in `lib/data/datasource/local/`
4. Update Repository to use cache-first pattern
5. Update Cubit to use `onFreshData` callback
6. Inject LocalDataSource in `main.dart`

**Clearing Cache:**
- Logout clears all user-related cache automatically
- Manual clear: `await database.delete(database.tableName).go()`
- Fresh install: Cache starts empty, populates on first fetch

**Debugging Offline Issues:**
1. Enable airplane mode and restart app
2. Check if `ConnectivityCubit.isOnline == false`
3. Verify offline banner appears
4. Check if data loads from cache (check logs for cache hits)
5. Verify network error doesn't crash app (should show cached data)
6. Test logout flow clears cache properly

## Version Management

When upgrading Flutter version, update:
1. `pubspec.yaml` - `environment.sdk` and `environment.flutter`
2. `.tool-versions` - Flutter version for asdf
3. `codemagic.yaml` - `env_versions` section (for CI/CD)

## Main Branch & PRs

- Main branch: `main`
- Always create PRs against `main`
- Use staging environment for testing before release
