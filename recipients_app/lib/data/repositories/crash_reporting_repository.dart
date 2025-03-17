import "dart:developer";

import "package:sentry_flutter/sentry_flutter.dart";

class CrashReportingRepository {
  const CrashReportingRepository();

  Future<void> logError(Exception exception, StackTrace stackTrace) async {
    log("--- SENTRY: Logging error: $exception");
    Sentry.captureException(exception, stackTrace: stackTrace);
  }

  Future<void> logInfo(String message) async {
    log("--- SENTRY: Logging info: $message");
    Sentry.captureMessage(message);
  }
}
