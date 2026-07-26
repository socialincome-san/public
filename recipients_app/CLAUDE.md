# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flutter mobile app (Android/iOS) for recipients of a Social Income basic-income program. It lets recipients keep
their personal data up-to-date, confirm monthly payments, and fill out impact-measurement surveys. This is the
`recipients_app` workspace inside the SocialIncome monorepo; see `../CLAUDE.md` for repo-wide conventions.

## Commands

All commands assume [FVM](https://fvm.app/) is installed and use the Flutter version pinned in `.fvmrc`.

```bash
make get              # fvm flutter pub get
make generate         # fvm dart run build_runner build (regenerate *.mapper.dart, *.g.dart)
make watch            # build_runner in watch mode, for active development
make translations     # fvm flutter gen-l10n (regenerate app_localizations.dart from lib/l10n/arb/app_en.arb)
make run-tests        # fvm flutter test (all tests incl. golden tests)
make update-tests     # fvm flutter test --update-goldens
make clean-build      # clean + get + generate + translations, use after pulling changes or switching branches
make flavor-stage     # regenerate Firebase config for the stage flavor via flutterfire CLI
make flavor-prod      # regenerate Firebase config for the prod flavor via flutterfire CLI
```

Run a single test file: `fvm flutter test test/path/to/some_test.dart`

Two build flavors exist: `stage` (staging Firebase project — use for development) and `prod` (production Firebase
project, requires config not in the repo).

## Architecture

Layered, repository-pattern architecture wired together in `lib/my_app.dart` via `RepositoryProvider`/`BlocProvider`
(flutter_bloc). Data flows: **DataSource → Repository → Cubit → View**.

### Data layer (`lib/data/`)

- **DataSource** (`datasource/`): an abstract interface per domain (e.g. `UserDataSource`, `PayoutDataSource`,
  `SurveyDataSource`) with two implementations:
  - `remote/` — talks to the real backend (Firebase Auth + the Social Income HTTP API, via `AuthenticatedClient`).
  - `demo/` — returns canned in-memory data, used for the app's demo mode and could also be used for offline/App Store review builds.
  - `local/app_cache_database.dart` — a Drift (SQLite) table used as an offline cache, keyed by string key.
- **Repository** (`repositories/`): one per domain, holds both the remote and demo data source plus `DemoManager`
  and picks the active one via `_activeDataSource` based on `demoManager.isDemoEnabled`. Repositories are also
  responsible for reading/writing the local cache and translating network errors into cache fallback (see
  `UserRepository.fetchRecipient`, which yields cached data first, then live data, and only rethrows a network
  exception if there was no usable cache).
- **Models** (`models/`): generated with `dart_mappable` (`@MappableClass`/`part *.mapper.dart` — regenerate with
  `make generate` after changing a model).
- **Services** (`services/`): singleton-ish infrastructure wrappers not tied to a single domain (`AuthService`,
  `ConnectivityService`, `FirebaseRemoteConfigService`).

### DemoManager (`lib/demo_manager.dart`)

Global singleton (`DemoManager()` factory) toggling `isDemoEnabled` app-wide as a broadcast stream. Every repository
reads this flag to decide between the remote and demo data source — this is the mechanism behind the app's demo
mode, not a build-time flag.

### State layer (`lib/core/cubits/`)

flutter_bloc `Cubit`s, one folder per domain (`auth/`, `payment/`, `settings/`, `signup/`, `survey/`,
`connectivity/`). Each folder has `*_cubit.dart`, `*_state.dart` (typically `part` of the cubit file, using
`dart_mappable` via `*_cubit.mapper.dart`). Cubits depend on repositories injected through the constructor (resolved
via `context.read<T>()` at the `BlocProvider` call site in `my_app.dart`), never construct data sources directly.
`AuthCubit` drives top-level navigation in `my_app.dart` via `state.status` (`AuthStatus` enum).

### View layer (`lib/view/`, `lib/ui/`)

- `view/pages/` — top-level screens; `view/widgets/` — reusable widgets, grouped by feature folder (`dashboard/`,
  `income/`, `survey/`, `account/`, `dialogs/`, `welcome/`).
  `income/balance_card/` renders payout status; note `PayoutsCubit._mapPayoutsUiState` in
  `lib/core/cubits/payment/payouts_cubit.dart` contains the business logic for deriving UI status (on-hold,
  recent-to-review, etc.) from a list of `Payout`s — read it before touching payout status logic.
- `ui/` — design-system-ish building blocks: `configs/` (theme), `buttons/`, `inputs/`, `icons/`, `navigation/`
  (holds `rootNavigatorKey`, used for navigation without a `BuildContext`).

### Entry points

`main.dart` holds the shared `runMainApp(FirebaseOptions)` used by both `main_stage.dart` and `main_prod.dart`
(separate entry points per flavor so only the required Firebase config is bundled). This is where all data
sources/services/repositories are constructed and threaded into `MyApp`.

### Localization

ARB source of truth is `lib/l10n/arb/app_en.arb` (plus `app_kri.arb`); `make translations` regenerates the
`AppLocalizations` classes in `lib/l10n/arb/`. Use translated strings via `context.l10n.someKey` (extension defined
in `lib/l10n/l10n.dart`). `lib/kri_intl.dart` contains hand-written localization delegates for the Krio (`kri`)
locale, which isn't natively supported by Flutter.

## Testing

- Unit/bloc tests use `bloc_test` and `mocktail`; see `test/data/` for repository/datasource test patterns.
- Golden tests use `alchemist` (`test/golden_tests/`, goldens in `test/golden_tests/goldens/{ci,macos,windows}`).
  Golden test setup lives in `test/helpers/`: `pump_app.dart` provides the `pumpApp` extension (wraps a widget in
  `MaterialApp` + `MultiBlocProvider` with a mocked `PayoutsCubit`), `flutter_test_config.dart` configures
  `AlchemistConfig` (theme, per-platform goldens). Regenerate goldens after an intentional UI change with
  `make update-tests` — never hand-edit golden PNGs.
- Manual test plans live in `docu/app_testing_guides/`.

## Firebase App Check

Debug builds require registering a local App Check debug token in the Firebase console before backend API calls
(`auth/request-otp`, `auth/verify-otp`) will succeed — see the "Firebase AppCheck" sections in `README.md` for the
iOS/Android steps to find and register the token. Never commit a debug token.

## Releasing

See `docu/app_release_guides/releasing.md`. CI/CD runs on CodeMagic, configured at the monorepo root
(`../codemagic.yaml`), not inside this workspace.
