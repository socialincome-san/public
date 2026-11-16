# ADR 0001: Storage location of the offline cache database

- Status: accepted
- Date: 2026-11-15

## Context

The app keeps an offline cache in a Drift (SQLite) database,
`AppCacheDatabase`. It holds the recipient, the payouts and the surveys
as JSON, so the app can show data without a connection. All of it can be
fetched again from the backend, and all of it is personal data.

Since the offline support was added, the database lived in the directory
returned by `getApplicationCacheDirectory()` on both platforms.

In release 2.0.1 an Android 13 device reported
`SqliteException(1032)` (`SQLITE_READONLY_DBMOVED`) in three separate
app sessions on one day (Sentry issues SI-MOBILEAPP-5Y, 5Z and 61).
SQLite raises this error when the database file is deleted or moved
while it is open. The device had less than 1 GB of free storage. The
most likely cause is Android clearing the app's cache directory to free
space; this was not observed directly.

Each failed cache write also discarded the data that had just been
fetched, so the person saw an error instead of their payouts.

The two candidate directories behave differently:

| | Cache directory | Application support directory |
| --- | --- | --- |
| Android path | `cacheDir` | `filesDir` |
| Android: cleared by the system | Any time storage is low, also while the app runs | Never |
| Android: included in backup | No | Yes, unless excluded |
| iOS path | `Library/Caches` | `Library/Application Support` |
| iOS: cleared by the system | When storage is low, only while the app is not running | Never |
| iOS: included in backup | No | Yes, unless excluded |

The Android manifest sets neither `allowBackup` nor backup rules, so
everything in `filesDir` is backed up to Google Drive and copied in
device-to-device transfers by default.

## Decision

The storage location differs per platform.

- **iOS:** the database stays in the cache directory. `Library/Caches`
  already gives the app what it needs: it is not backed up, and iOS does
  not clear it while the app runs. See the last alternative below for
  why the database is not moved to the same kind of location as on
  Android.
- **Android:** the database lives in `files/offline_cache/`, a
  subdirectory of the application support directory. This directory is
  excluded from cloud backup and device transfer in
  `res/xml/backup_rules.xml` (Android 11 and lower) and
  `res/xml/data_extraction_rules.xml` (Android 12 and higher).
- **Both platforms:** `AppCacheDatabase.put` is best effort. A failed
  write is reported to Sentry without the statement parameters and does
  not fail the caller.

On Android the old database file in the cache directory is deleted when
the database is first opened, because a logout would no longer clear it
there.

## Alternatives considered

- **Keep the cache directory on both platforms and only make writes best
  effort.** The person would no longer see an error, but on Android the
  cache would stay stale until the next app start after every purge, and
  the error would keep appearing in Sentry.
- **Use the application support directory on both platforms without
  backup rules.** This stops the purging, but puts cached personal data
  into Google and iCloud backups and restores a stale cache on a new
  device.
- **Use the application support directory on iOS too, excluded from
  backup.** Both platforms would then use the same kind of location.
  Excluding a directory from iCloud and Finder backups is a small
  change: set `isExcludedFromBackup` on the directory URL. We decided
  against it for these reasons:
  - iOS does not clear `Library/Caches` while the app runs, so there is
    no problem to solve there.
  - `path_provider` does not expose the flag, so it needs native Swift
    code in `AppDelegate.swift`.
  - The flag is stored on the directory and is lost when the directory
    is recreated, so it has to be set on every launch.
  - It cannot be covered by a unit test. Confirming it needs a device
    backup.
  - Apple asks apps to keep data that can be downloaded again in
    `Library/Caches`.

## Consequences

- Android no longer removes the database while the app is using it.
- Cached personal data stays out of backups on both platforms.
- On Android the cache now counts as app data: "Clear cache" in the
  system settings no longer removes it, only "Clear storage" or an
  uninstall does. The system can also no longer reclaim this space when
  storage is low.
- The directory name `offline_cache` appears in
  `app_cache_database.dart` and in both backup rule files. A rename has
  to change all three.
- The two platforms store the database in different places. Code that
  needs the path must go through `AppCacheDatabase`.
- A cache write can fail silently for the person. Sentry is the only
  place such failures show up.
- The exclusion from Android backups was checked in the merged manifest
  only, not with a real backup and restore on a device.
