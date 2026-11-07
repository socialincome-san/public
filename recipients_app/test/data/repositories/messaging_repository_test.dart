import "package:app/data/repositories/messaging_repository.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter_local_notifications/flutter_local_notifications.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

class _MockFirebaseMessaging extends Mock implements FirebaseMessaging {}

class _MockLocalNotificationsPlugin extends Mock implements FlutterLocalNotificationsPlugin {}

class _FakeNotificationDetails extends Fake implements NotificationDetails {}

void main() {
  setUpAll(() {
    registerFallbackValue(_FakeNotificationDetails());
  });

  test("shows incoming pushes as local notifications with unique IDs", () async {
    final messaging = _MockFirebaseMessaging();
    when(() => messaging.onTokenRefresh).thenAnswer((_) => const Stream.empty());
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
    final messaging = _MockFirebaseMessaging();
    when(() => messaging.onTokenRefresh).thenAnswer((_) => const Stream.empty());
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
    final messaging = _MockFirebaseMessaging();
    when(() => messaging.onTokenRefresh).thenAnswer((_) => const Stream.empty());
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
    final messaging = _MockFirebaseMessaging();
    when(() => messaging.onTokenRefresh).thenAnswer((_) => const Stream.empty());
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
}
