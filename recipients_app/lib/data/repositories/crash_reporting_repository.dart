import "package:firebase_crashlytics/firebase_crashlytics.dart";

class CrashReportingRepository {
  final FirebaseCrashlytics crashlytics;

  CrashReportingRepository({required this.crashlytics});

  Future<void> logError(Exception exception, StackTrace stackTrace) =>
      crashlytics.recordError(exception, stackTrace);
}
