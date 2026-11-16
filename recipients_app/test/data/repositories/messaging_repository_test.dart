import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/data/repositories/messaging_repository.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter_local_notifications/flutter_local_notifications.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

class _MockFirebaseMessaging extends Mock implements FirebaseMessaging {}

class _MockLocalNotificationsPlugin extends Mock implements FlutterLocalNotificationsPlugin {}

class _FakeNotificationDetails extends Fake implements NotificationDetails {}

class _MockNotificationSettings extends Mock implements NotificationSettings {}

class _MockCrashReportingRepository extends Mock implements CrashReportingRepository {}

_MockLocalNotificationsPlugin _createLocalNotifications() {
  final localNotifications = _MockLocalNotificationsPlugin();
  when(
    () => localNotifications.show(
      id: any(named: "id"),
      title: any(named: "title"),
      body: any(named: "body"),
      notificationDetails: any(named: "notificationDetails"),
    ),
  ).thenAnswer((_) async {});
  return localNotifications;
}

void _verifyShown(
  _MockLocalNotificationsPlugin localNotifications, {
  required String? title,
  required String? body,
}) {
  verify(
    () => localNotifications.show(
      id: any(named: "id"),
      title: title,
      body: body,
      notificationDetails: any(named: "notificationDetails"),
    ),
  ).called(1);
}

void _verifyNothingShown(_MockLocalNotificationsPlugin localNotifications) {
  verifyNever(
    () => localNotifications.show(
      id: any(named: "id"),
      title: any(named: "title"),
      body: any(named: "body"),
      notificationDetails: any(named: "notificationDetails"),
    ),
  );
}

_MockFirebaseMessaging _createMessaging({
  AuthorizationStatus authorizationStatus = AuthorizationStatus.authorized,
}) {
  final messaging = _MockFirebaseMessaging();
  when(() => messaging.onTokenRefresh).thenAnswer((_) => const Stream.empty());
  final settings = _MockNotificationSettings();
  when(() => settings.authorizationStatus).thenReturn(authorizationStatus);
  when(() => messaging.getNotificationSettings()).thenAnswer((_) async => settings);
  return messaging;
}

void main() {
  setUpAll(() {
    registerFallbackValue(_FakeNotificationDetails());
    registerFallbackValue(Exception());
    registerFallbackValue(StackTrace.empty);
  });

  test("shows incoming pushes as local notifications with unique IDs", () async {
    final messaging = _createMessaging();
    final localNotifications = _MockLocalNotificationsPlugin();
    when(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).thenAnswer((_) async {});

    final repository = MessagingRepository(
      messaging: messaging,
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        messageId: "push-1",
        notification: RemoteNotification(
          title: "Payment received",
          body: "Confirm your payment",
        ),
      ),
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        messageId: "push-2",
        notification: RemoteNotification(
          title: "Payment confirmed",
          body: "Your next payment is scheduled",
        ),
      ),
    );

    final notificationIds = verify(
      () => localNotifications.show(
        id: captureAny(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).captured;

    expect(notificationIds, hasLength(2));
    expect(notificationIds.toSet(), hasLength(2));
  });

  test("uses display text from a data-only push", () async {
    final messaging = _createMessaging();
    final localNotifications = _MockLocalNotificationsPlugin();
    when(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).thenAnswer((_) async {});

    final repository = MessagingRepository(
      messaging: messaging,
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        data: {"title": "Payment received", "body": "Confirm your payment"},
      ),
    );

    verify(
      () => localNotifications.show(
        id: any(named: "id"),
        title: "Payment received",
        body: "Confirm your payment",
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).called(1);
  });

  test("uses data text when notification fields are empty", () async {
    final messaging = _createMessaging();
    final localNotifications = _MockLocalNotificationsPlugin();
    when(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).thenAnswer((_) async {});

    final repository = MessagingRepository(
      messaging: messaging,
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        notification: RemoteNotification(title: "", body: ""),
        data: {"title": "Payment received", "body": "Confirm your payment"},
      ),
    );

    verify(
      () => localNotifications.show(
        id: any(named: "id"),
        title: "Payment received",
        body: "Confirm your payment",
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).called(1);
  });

  test("does not show a local notification without display text", () async {
    final messaging = _createMessaging();
    final localNotifications = _MockLocalNotificationsPlugin();
    final repository = MessagingRepository(
      messaging: messaging,
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(const RemoteMessage());

    verifyNever(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    );
  });

  test("does not show a local notification when notification permission is denied", () async {
    final messaging = _createMessaging(authorizationStatus: AuthorizationStatus.denied);
    final localNotifications = _MockLocalNotificationsPlugin();
    final repository = MessagingRepository(
      messaging: messaging,
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        notification: RemoteNotification(
          title: "Payment received",
          body: "Confirm your payment",
        ),
      ),
    );

    verifyNever(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    );
  });

  test("prefers notification text over data text", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        notification: RemoteNotification(title: "Notification title", body: "Notification body"),
        data: {"title": "Data title", "body": "Data body"},
      ),
    );

    _verifyShown(localNotifications, title: "Notification title", body: "Notification body");
  });

  test("shows a notification with only a title", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(notification: RemoteNotification(title: "Payment received")),
    );

    _verifyShown(localNotifications, title: "Payment received", body: null);
  });

  test("shows a notification with only a body", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(data: {"body": "Confirm your payment"}),
    );

    _verifyShown(localNotifications, title: null, body: "Confirm your payment");
  });

  test("treats whitespace-only text as missing", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        notification: RemoteNotification(title: "  ", body: "\n"),
        data: {"title": " ", "body": "\t"},
      ),
    );

    _verifyNothingShown(localNotifications);
  });

  test("ignores non-string data values", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(data: {"title": 42, "body": true}),
    );

    _verifyNothingShown(localNotifications);
  });

  test("does not show a local notification when permission is not determined", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(authorizationStatus: AuthorizationStatus.notDetermined),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(notification: RemoteNotification(title: "Payment received")),
    );

    _verifyNothingShown(localNotifications);
  });

  test("shows a local notification when permission is provisional", () async {
    final localNotifications = _createLocalNotifications();
    final repository = MessagingRepository(
      messaging: _createMessaging(authorizationStatus: AuthorizationStatus.provisional),
      localNotifications: localNotifications,
    );

    await repository.handleForegroundMessage(
      const RemoteMessage(
        notification: RemoteNotification(title: "Payment received", body: "Confirm your payment"),
      ),
    );

    _verifyShown(localNotifications, title: "Payment received", body: "Confirm your payment");
  });

  test("reports and swallows errors when showing a notification fails", () async {
    final localNotifications = _MockLocalNotificationsPlugin();
    final exception = Exception("show failed");
    when(
      () => localNotifications.show(
        id: any(named: "id"),
        title: any(named: "title"),
        body: any(named: "body"),
        notificationDetails: any(named: "notificationDetails"),
      ),
    ).thenThrow(exception);
    final crashReporting = _MockCrashReportingRepository();
    when(() => crashReporting.logError(any(), any())).thenAnswer((_) async {});
    final repository = MessagingRepository(
      messaging: _createMessaging(),
      localNotifications: localNotifications,
      crashReportingRepository: crashReporting,
    );

    await expectLater(
      repository.handleForegroundMessage(
        const RemoteMessage(notification: RemoteNotification(title: "Payment received")),
      ),
      completes,
    );

    verify(() => crashReporting.logError(exception, any())).called(1);
  });
}
