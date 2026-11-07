import "dart:async";

import "package:app/data/models/language_code.dart";
import "package:app/data/repositories/messaging_repository.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

class _MockFirebaseMessaging extends Mock implements FirebaseMessaging {}

void main() {
  late _MockFirebaseMessaging messaging;
  late MessagingRepository messagingRepository;

  setUp(() {
    messaging = _MockFirebaseMessaging();
    when(
      () => messaging.onTokenRefresh,
    ).thenAnswer((_) => const Stream.empty());
    messagingRepository = MessagingRepository(messaging: messaging);
  });

  test(
    "subscribes to topics for the selected language and removes the other language",
    () async {
      when(() => messaging.subscribeToTopic(any())).thenAnswer((_) async {});
      when(
        () => messaging.unsubscribeFromTopic(any()),
      ).thenAnswer((_) async {});

      await messagingRepository.updateNotificationTopics(LanguageCode.kri);

      verify(() => messaging.subscribeToTopic("payments_kri")).called(1);
      verify(() => messaging.subscribeToTopic("news_kri")).called(1);
      verify(() => messaging.unsubscribeFromTopic("payments_en")).called(1);
      verify(() => messaging.unsubscribeFromTopic("news_en")).called(1);
    },
  );

  test("uses English topics for other app languages", () async {
    when(() => messaging.subscribeToTopic(any())).thenAnswer((_) async {});
    when(() => messaging.unsubscribeFromTopic(any())).thenAnswer((_) async {});

    await messagingRepository.updateNotificationTopics(LanguageCode.de);

    verify(() => messaging.subscribeToTopic("payments_en")).called(1);
    verify(() => messaging.subscribeToTopic("news_en")).called(1);
    verify(() => messaging.unsubscribeFromTopic("payments_kri")).called(1);
    verify(() => messaging.unsubscribeFromTopic("news_kri")).called(1);
  });

  test("starts every topic operation when one fails synchronously", () async {
    when(
      () => messaging.subscribeToTopic("payments_kri"),
    ).thenThrow(Exception("subscription failed"));
    when(() => messaging.subscribeToTopic("news_kri")).thenAnswer((_) async {});
    when(
      () => messaging.unsubscribeFromTopic("payments_en"),
    ).thenAnswer((_) async {});
    when(
      () => messaging.unsubscribeFromTopic("news_en"),
    ).thenAnswer((_) async {});

    await expectLater(
      messagingRepository.updateNotificationTopics(LanguageCode.kri),
      throwsA(isA<Exception>()),
    );

    verify(() => messaging.subscribeToTopic("payments_kri")).called(1);
    verify(() => messaging.subscribeToTopic("news_kri")).called(1);
    verify(() => messaging.unsubscribeFromTopic("payments_en")).called(1);
    verify(() => messaging.unsubscribeFromTopic("news_en")).called(1);
  });

  test("serializes concurrent topic updates", () async {
    final paymentsEnglish = Completer<void>();
    final newsEnglish = Completer<void>();
    final paymentsKrio = Completer<void>();
    final newsKrio = Completer<void>();
    when(() => messaging.subscribeToTopic(any())).thenAnswer((_) async {});
    when(() => messaging.unsubscribeFromTopic(any())).thenAnswer((_) async {});
    when(
      () => messaging.subscribeToTopic("payments_en"),
    ).thenAnswer((_) => paymentsEnglish.future);
    when(
      () => messaging.subscribeToTopic("news_en"),
    ).thenAnswer((_) => newsEnglish.future);
    when(
      () => messaging.unsubscribeFromTopic("payments_kri"),
    ).thenAnswer((_) => paymentsKrio.future);
    when(
      () => messaging.unsubscribeFromTopic("news_kri"),
    ).thenAnswer((_) => newsKrio.future);

    final englishUpdate = messagingRepository.updateNotificationTopics(
      LanguageCode.en,
    );
    final krioUpdate = messagingRepository.updateNotificationTopics(
      LanguageCode.kri,
    );
    await Future<void>.delayed(Duration.zero);

    verify(() => messaging.subscribeToTopic("payments_en")).called(1);
    verify(() => messaging.subscribeToTopic("news_en")).called(1);
    verifyNever(() => messaging.subscribeToTopic("payments_kri"));

    paymentsEnglish.complete();
    newsEnglish.complete();
    paymentsKrio.complete();
    newsKrio.complete();
    await Future.wait([englishUpdate, krioUpdate]);

    verify(() => messaging.subscribeToTopic("payments_kri")).called(1);
    verify(() => messaging.subscribeToTopic("news_kri")).called(1);
    verify(() => messaging.unsubscribeFromTopic("payments_en")).called(1);
    verify(() => messaging.unsubscribeFromTopic("news_en")).called(1);
  });
}
