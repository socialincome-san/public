import "package:drift/drift.dart";
import "package:drift_flutter/drift_flutter.dart";
import "package:path_provider/path_provider.dart";

part "app_database.g.dart";

// Recipients table - stores entire JSON
class Recipients extends Table {
  TextColumn get id => text()();
  TextColumn get recipientJson => text()(); // Full Recipient object as JSON
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// Payouts table - flat structure
class Payouts extends Table {
  TextColumn get id => text()();
  TextColumn get recipientId => text()(); // For filtering
  IntColumn get amount => integer()();
  RealColumn get amountChf => real().nullable()();
  TextColumn get currency => text()();
  TextColumn get paymentAt => text()();
  TextColumn get status => text()();
  TextColumn get phoneNumber => text().nullable()();
  TextColumn get comments => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// Surveys table - stores JSON for questionnaire
class Surveys extends Table {
  TextColumn get id => text()();
  TextColumn get recipientId => text()(); // For filtering
  TextColumn get name => text()();
  TextColumn get language => text()();
  TextColumn get dueAt => text()();
  TextColumn get completedAt => text().nullable()();
  TextColumn get questionnaireJson => text()(); // SurveyQuestionnaire as JSON
  TextColumn get status => text()();
  TextColumn get surveyScheduleId => text().nullable()();
  TextColumn get dataJson => text().nullable()(); // Object? data field
  TextColumn get accessEmail => text()();
  TextColumn get accessPw => text()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// UpdateQueue table - stores pending update operations
class UpdateQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get operationType => text()(); // 'confirm_payment', 'update_recipient', etc.
  TextColumn get operationPayload => text()(); // JSON serialized parameters
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get status => text().withDefault(const Constant("pending"))(); // pending/processing/failed
  TextColumn get error => text().nullable()();
}

@DriftDatabase(tables: [Recipients, Payouts, Surveys, UpdateQueue])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? executor]) : super(executor ?? _openConnection());

  @override
  int get schemaVersion => 1;

  // Migration strategy for future versions
  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onUpgrade: (migrator, from, to) async {
        // Future migrations will go here
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
}
