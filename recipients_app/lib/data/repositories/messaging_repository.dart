// "unreachable_from_main" is ignored because "_firebaseMessagingBackgroundHandler" is only called
// from native code (via @pragma("vm:entry-point")), so the analyzer considers it unreachable.
// ignore_for_file: unreachable_from_main
import "dart:async";
import "dart:developer";
import "dart:io";

import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:firebase_core/firebase_core.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/foundation.dart";
import "package:flutter_local_notifications/flutter_local_notifications.dart";

/// Handles pushes that arrive while the app is in the background or closed (not tapped).
///
/// The system displays notification pushes itself; this is only for extra processing.
/// It runs in a separate isolate, so it must be a top-level function and cannot use
/// app state. The pragma keeps it from being removed by tree shaking in release builds.
@pragma("vm:entry-point")
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  log("PUSHNOTIFICATION: Terminated Background Message");
  // Because this runs in its own isolate, call `Firebase.initializeApp()` first if other
  // Firebase services (e.g. Firestore) are ever needed here.
  //await Firebase.initializeApp();
  MessagingRepository.logRemoteMessage(message);
}

class MessagingRepository {
  static const _androidNotificationChannelId = "social_income_notifications";
  static const _androidNotificationChannelName = "Social Income";
  static const _androidNotificationChannelDescription = "Updates from Social Income";
  static const _androidNotificationChannel = AndroidNotificationChannel(
    _androidNotificationChannelId,
    _androidNotificationChannelName,
    description: _androidNotificationChannelDescription,
    importance: Importance.high,
  );

  final FirebaseMessaging messaging;
  final FlutterLocalNotificationsPlugin localNotifications;
  final CrashReportingRepository? crashReportingRepository;
  int _nextNotificationId = DateTime.now().millisecondsSinceEpoch & 0x7fffffff;

  MessagingRepository({
    required this.messaging,
    required this.localNotifications,
    this.crashReportingRepository,
  }) {
    messaging.onTokenRefresh.listen((event) {
      log("PUSHNOTIFICATION: FCM Token refreshed: $event");
    });
  }

  Future<void> initNotifications() async {
    // Shows the system permission prompt on iOS and on Android 13+. Local notifications
    // reuse this permission, which is why DarwinInitializationSettings below does not request it.
    await messaging.requestPermission();

    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleInitialMessage(initialMessage);
    }

    // Pushes received (not tapped) while the app is in the background or closed.
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    // The user tapped a notification while the app was in the background (still running).
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

    // Set up flutter_local_notifications before listening to foreground pushes below,
    // so no push can reach localNotifications.show() before initialize() has finished.
    try {
      // Don't check the return value: on iOS it is the result of the plugin's own permission
      // request, which is always false here because DarwinInitializationSettings requests none.
      // Real initialization failures throw a PlatformException, which is caught below.
      await localNotifications.initialize(
        settings: const InitializationSettings(
          android: AndroidInitializationSettings("ic_launcher_foreground"),
          iOS: DarwinInitializationSettings(
            requestAlertPermission: false,
            requestBadgePermission: false,
            requestSoundPermission: false,
          ),
        ),
      );

      await localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(_androidNotificationChannel);
    } on Exception catch (exception, stackTrace) {
      crashReportingRepository?.logError(exception, stackTrace);
      log(
        "PUSHNOTIFICATION: Failed to initialize local notifications",
        error: exception,
        stackTrace: stackTrace,
      );
    }

    // Pushes received while the app is open. Neither platform displays these on its own here:
    // Android never does, and on iOS we deliberately leave
    // setForegroundNotificationPresentationOptions off. Do not enable it: handleForegroundMessage
    // already shows a local notification, so iOS would display every push twice.
    FirebaseMessaging.onMessage.listen(handleForegroundMessage);

    // Log the FCM token in debug builds so a developer can target this device with test pushes.
    // Runs last so a token error cannot prevent the listeners above from being registered.
    if (kDebugMode) {
      final token = await getToken();
      log("PUSHNOTIFICATION: Current FCM token: $token");
    }
  }

  /// Shows a push that arrived while the app is open as a local notification.
  ///
  /// Text is taken from the notification payload, falling back to the data payload
  /// ("title"/"body"), so data-only pushes are shown too. Errors are reported, never rethrown,
  /// because this runs inside the onMessage stream listener.
  @visibleForTesting
  Future<void> handleForegroundMessage(RemoteMessage message) async {
    log("PUSHNOTIFICATION: Foreground Message received");
    logRemoteMessage(message);

    // A notification needs at least a title or a body; skip pushes that have neither.
    final title = _nonEmptyString(message.notification?.title) ?? _nonEmptyString(message.data["title"]);
    final body = _nonEmptyString(message.notification?.body) ?? _nonEmptyString(message.data["body"]);
    if (title == null && body == null) {
      return;
    }

    try {
      // The user may have turned notifications off in system settings since startup.
      // Provisional (iOS quiet delivery) is allowed; iOS decides how to present it.
      final settings = await messaging.getNotificationSettings();
      const allowed = {AuthorizationStatus.authorized, AuthorizationStatus.provisional};
      if (!allowed.contains(settings.authorizationStatus)) return;

      await localNotifications.show(
        id: _nextNotificationId++,
        title: title,
        body: body,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            _androidNotificationChannelId,
            _androidNotificationChannelName,
            channelDescription: _androidNotificationChannelDescription,
            // High importance/priority makes Android show a heads-up banner, not just a status bar icon.
            // Importance applies on Android 8+ (via the channel), priority on Android 7.1 and lower.
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
            presentBanner: true,
            presentList: true,
          ),
        ),
      );
    } on Exception catch (exception, stackTrace) {
      crashReportingRepository?.logError(exception, stackTrace);
      log(
        "PUSHNOTIFICATION: Failed to show foreground notification",
        error: exception,
        stackTrace: stackTrace,
      );
    }
  }

  void _handleBackgroundMessage(RemoteMessage message) {
    // Called when the user taps a notification while the app is in the background (still running).
    // TODO: navigate to the screen the notification refers to (e.g. payment, survey).
    log("PUSHNOTIFICATION: Background Message received");
    logRemoteMessage(message);
  }

  void _handleInitialMessage(RemoteMessage message) {
    // Called once with the notification the user tapped to launch the app from a fully closed state.
    // TODO: navigate to the screen the notification refers to (e.g. payment, survey).
    log("PUSHNOTIFICATION: Initial Message received");
    logRemoteMessage(message);
  }

  /// Returns this device's FCM token, or null if iOS still has no APNs token after 3 attempts.
  /// Other Firebase errors are rethrown.
  Future<String?> getToken() async {
    const maxRetries = 3;
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      if (Platform.isIOS) {
        // The APNS token may not be registered with the device yet, so wait a bit before
        // asking for the FCM token.
        await Future.delayed(const Duration(seconds: 1));
      }
      try {
        return await messaging.getToken();
      } on FirebaseException catch (e) {
        if (e.code != "apns-token-not-set") rethrow;
        if (attempt == maxRetries - 1) {
          log("PUSHNOTIFICATION: Failed to get FCM token after $maxRetries retries: ${e.code}");
          break;
        }
        log("PUSHNOTIFICATION: APNS token not yet set, retrying (${attempt + 1}/$maxRetries)");
      }
    }
    return null;
  }

  String? _nonEmptyString(Object? value) => value is String && value.trim().isNotEmpty ? value : null;

  static void logRemoteMessage(RemoteMessage message) {
    if (message.notification != null) {
      log("RemoteMessage message.notification: ${message.notification}");
      log('RemoteMessage message.notification?.title: ${message.notification?.title ?? ''}');
      log('RemoteMessage message.notification?.body: ${message.notification?.body ?? ''}');
    }
    log("RemoteMessage message.messageType: ${message.messageType}");
    log("RemoteMessage message.messageId: ${message.messageId}");
    log("RemoteMessage message.category: ${message.category}");
    log("RemoteMessage message.from: ${message.from}");
    log("RemoteMessage message.data: ${message.data}");
    log("RemoteMessage message.sentTime: ${message.sentTime}");
  }
}
