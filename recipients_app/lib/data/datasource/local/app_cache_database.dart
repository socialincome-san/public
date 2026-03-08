import "package:drift/drift.dart";
import "package:drift_flutter/drift_flutter.dart";
import "package:path_provider/path_provider.dart";

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
      name: "social_income.db",
      native: const DriftNativeOptions(
        // The database file is internal app data, so it should be hidden from the user
        // and placed in Application Support directory. Furthermore this directory is automatically backed up by the OS.
        // It will not cleared by the OS and persists across app updates and restarts.
        databaseDirectory: getApplicationSupportDirectory,
      ),
      // If you need web support, see https://drift.simonbinder.eu/platforms/web/
    );
  }

  Future<String?> get(String key) async {
    final query = select(cacheEntries)..where((t) => t.key.equals(key));
    final result = await query.getSingleOrNull();
    return result?.data;
  }

  Future<void> put(String key, String data) async {
    await into(cacheEntries).insertOnConflictUpdate(
      CacheEntriesCompanion.insert(
        key: key,
        data: data,
        updatedAt: DateTime.now().millisecondsSinceEpoch,
      ),
    );
  }

  Future<void> clearAll() async {
    await delete(cacheEntries).go();
  }
}
