// "unreachable_from_main" is ignored beacuse of the vm:entry-point function "_firebaseMessagingBackgroundHandler"
// ignore_for_file: unreachable_from_main
import "dart:developer";
import "package:firebase_messaging/firebase_messaging.dart";

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
  final FirebaseMessaging messaging;

  MessagingRepository({required this.messaging}) {
    messaging.onTokenRefresh.listen((event) {
      log("PUSHNOTIFICATION: FCM Token refreshed: $event");
    });
  }

  Future<void> initNotifications() async {
    await messaging.requestPermission(criticalAlert: true);

    /// This is needed for testing and specific targeting of devices
    final token = await getToken();
    log("PUSHNOTIFICATION: Current FCM token: $token");

    /// Get any messages which caused the application to open from a terminated state.
    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleInitialMessage(initialMessage);
    }

    // Set function which is called when the app is in the background or terminated.
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Set function which is called to handle any interaction when the app is in the background (not terminated) via a Stream listener
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

    // Set a function which is called to handle any interaction when the app is in the foreground via a Stream listener
    // For showing local notifications another package is needed: flutter_local_notifications => https://pub.dev/packages/flutter_local_notifications#-supported-platforms
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    /// Notification messages which arrive while the app is in foreground will not display a visible notification by default.
    /// To override this behavior on iOS, we update the presentation options for the app to change this behaviour.
    /// To override this behavior on Android, you must create a "High Priority" notification channel which can be done
    /// with the above mentioned package "flutter_local_notifications".
    /// See also blog article: https://medium.com/@ChanakaDev/android-channels-in-flutter-003907b151e5
    messaging.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true);
  }

  void _handleForegroundMessage(RemoteMessage message) {
    // TODO implement displaying push notifications if app is open
    log("PUSHNOTIFICATION: Foreground Message received");
    logRemoteMessage(message);
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
    return await messaging.getToken();
  }

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
