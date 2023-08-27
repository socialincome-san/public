import "dart:developer";

import "package:firebase_messaging/firebase_messaging.dart";

/// This must be a top level function in order to work
Future<void> handleBackgroundMessage(RemoteMessage message) async {
  log("PUSHNOTIFICATION title: ${message.notification?.title}");
  log("PUSHNOTIFICATION body: ${message.notification?.body}");
  log("PUSHNOTIFICATION data: ${message.data}");
}

class MessagingRepository {
  final FirebaseMessaging messaging;

  MessagingRepository({
    required this.messaging,
  }) {
    messaging.onTokenRefresh.listen((event) {
      log("token refreshed: $event");
    });
  }

  Future<void> initNotifications() async {
    await messaging.requestPermission(
      criticalAlert: true,
    );

    /// This is needed for testing and specific targeting of devices
    await messaging.getToken();

    /// handle background messages when app is not in foreground
    FirebaseMessaging.onBackgroundMessage(handleBackgroundMessage);
    messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    /// handle messages when app is in foreground
    /// if we want to display notifications while the app is open
    /// we have to handle them ourselfes with for eg using
    /// flutter_local_notifications and then we can use it like this:
    // final initialMessage = await messaging.getInitialMessage();
    // handleMessage(initialMessage);
  }

  void handleMessage(RemoteMessage? message) {
    if (message == null) return;

    // TODO implement displaying push notifications if app is open
  }

  Future<String?> getToken() async {
    return await messaging.getToken();
  }
}
