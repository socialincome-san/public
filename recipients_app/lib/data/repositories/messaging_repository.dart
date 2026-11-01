// "unreachable_from_main" is ignored beacuse of the vm:entry-point function "_firebaseMessagingBackgroundHandler"
// ignore_for_file: unreachable_from_main
import "dart:async";
import "dart:developer";
import "dart:io";

import "package:firebase_core/firebase_core.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/foundation.dart";
import "package:flutter_local_notifications/flutter_local_notifications.dart";

/// This must be a top level function in order to work
@pragma("vm:entry-point")
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  log("PUSHNOTIFICATION: Terminated Background Message");
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  //await Firebase.initializeApp();
  MessagingRepository.logRemoteMessage(message);
}

class MessagingRepository {
  static const _androidNotificationChannelId = "social_income_notifications";
  static const _androidNotificationChannelName = "Social Income";
  static const _androidNotificationChannelDescription =
      "Updates from Social Income";
  static const _androidNotificationChannel = AndroidNotificationChannel(
    _androidNotificationChannelId,
    _androidNotificationChannelName,
    description: _androidNotificationChannelDescription,
    importance: Importance.high,
  );

  final FirebaseMessaging messaging;
  final FlutterLocalNotificationsPlugin localNotifications;

  MessagingRepository({
    required this.messaging,
    required this.localNotifications,
  }) {
    messaging.onTokenRefresh.listen((event) {
      log("PUSHNOTIFICATION: FCM Token refreshed: $event");
    });
  }

  Future<void> initNotifications() async {
    await messaging.requestPermission(
      criticalAlert: true,
    );
    final notificationsInitialized = await localNotifications.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings("ic_launcher_foreground"),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
        ),
      ),
    );
    if (notificationsInitialized != true) {
      throw Exception("Failed to initialize local notifications.");
    }
    await localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidNotificationChannel);

    /// This is needed for testing and specific targeting of devices
    final token = await getToken();
    log("PUSHNOTIFICATION: Current FCM token: $token");

    /// Get any messages which caused the application to open from a terminated state.
    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null){
      _handleInitialMessage(initialMessage);
    }

    // Set function which is called when the app is in the background or terminated.
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Set function which is called to handle any interaction when the app is in the background (not terminated) via a Stream listener
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

    // Set a function which is called to handle any interaction when the app is in the foreground via a Stream listener
    // For showing local notifications another package is needed: flutter_local_notifications => https://pub.dev/packages/flutter_local_notifications#-supported-platforms
    FirebaseMessaging.onMessage.listen(
      (message) => unawaited(handleForegroundMessage(message)),
    );
  }

  @visibleForTesting
  Future<void> handleForegroundMessage(RemoteMessage message) async {
    log("PUSHNOTIFICATION: Foreground Message received");
    logRemoteMessage(message);

    final title = message.notification?.title ?? _stringValue(message.data["title"]);
    final body = message.notification?.body ?? _stringValue(message.data["body"]);
    if ((title == null || title.isEmpty) && (body == null || body.isEmpty)) {
      return;
    }

    try {
      await localNotifications.show(
        id: message.messageId?.hashCode ?? message.hashCode,
        title: title,
        body: body,
        notificationDetails: const NotificationDetails(
          android: AndroidNotificationDetails(
            _androidNotificationChannelId,
            _androidNotificationChannelName,
            channelDescription: _androidNotificationChannelDescription,
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
      log(
        "PUSHNOTIFICATION: Failed to show foreground notification",
        error: exception,
        stackTrace: stackTrace,
      );
    }
  }

  void _handleBackgroundMessage(RemoteMessage message) {
    // TODO implement handling of push notifications if app is in background
    log("PUSHNOTIFICATION: Background Message received");
    logRemoteMessage(message);
  }

  void _handleInitialMessage(RemoteMessage message) {
    // TODO implement displaying push notifications if app is open
    log("PUSHNOTIFICATION: Initial Message received");
    logRemoteMessage(message);
  }

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

  String? _stringValue(Object? value) => value is String ? value : null;

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
