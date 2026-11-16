import "dart:io";

import "package:drift/drift.dart";
import "package:drift_flutter/drift_flutter.dart";
import "package:path/path.dart" as p;
import "package:path_provider/path_provider.dart";
import "package:sentry_flutter/sentry_flutter.dart";

part "app_cache_database.g.dart";

class CacheEntries extends Table {
  TextColumn get key => text()();
  TextColumn get data => text()();
  IntColumn get updatedAt => integer()();

  @override
  Set<Column> get primaryKey => {key};
}

@DriftDatabase(tables: [CacheEntries])
class AppCacheDatabase extends _$AppCacheDatabase {
  AppCacheDatabase([QueryExecutor? executor]) : super(executor ?? _openConnection());

  @override
  int get schemaVersion => 1;

  // Migration strategy for future versions
  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onUpgrade: (migrator, from, to) async {
        // Future migrations will go here
        if (from == 1) {
          // Add UpdateQueue table in schema version 2
        }
      },
    );
  }

  static QueryExecutor _openConnection() {
    return driftDatabase(
      name: _databaseName,
      native: const DriftNativeOptions(
        databaseDirectory: _databaseDirectory,
      ),
      // If you need web support, see https://drift.simonbinder.eu/platforms/web/
    );
  }

  static const _databaseName = "social_income.db";

  // iOS never clears the cache directory while the app runs. Android does when storage runs low,
  // and every later write then fails with SQLITE_READONLY_DBMOVED (1032). The Android directory
  // is excluded from backups in res/xml/backup_rules.xml and data_extraction_rules.xml.
  static Future<Directory> _databaseDirectory() async {
    final cacheDirectory = await getApplicationCacheDirectory();
    if (!Platform.isAndroid) {
      return cacheDirectory;
    }

    await _deleteLegacyDatabase(cacheDirectory);
    final supportDirectory = await getApplicationSupportDirectory();
    return Directory(p.join(supportDirectory.path, "offline_cache")).create();
  }

  // Up to 2.0.1 the Android database lived in the cache directory. It holds personal data that
  // logout would no longer clear there.
  static Future<void> _deleteLegacyDatabase(Directory cacheDirectory) async {
    for (final suffix in ["", "-wal", "-shm", "-journal"]) {
      final file = File(p.join(cacheDirectory.path, "$_databaseName.sqlite$suffix"));
      if (file.existsSync()) await file.delete();
    }
  }

  Future<String?> get(String key) async {
    final query = select(cacheEntries)..where((t) => t.key.equals(key));
    final result = await query.getSingleOrNull();
    return result?.data;
  }

  // Best effort: a failed cache write must not discard the data the caller just fetched.
  Future<void> put(String key, String data) async {
    try {
      await into(cacheEntries).insertOnConflictUpdate(
        CacheEntriesCompanion.insert(
          key: key,
          data: data,
          updatedAt: DateTime.now().millisecondsSinceEpoch,
        ),
      );
    } on Exception catch (exception, stackTrace) {
      // Drift appends the statement parameters, i.e. the cached personal data, to the message.
      final reason = exception.toString().split("Causing statement").first.trim();
      Sentry.captureException(
        Exception("Cache write failed for '$key': $reason"),
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> clearAll() async {
    await delete(cacheEntries).go();
  }
}
