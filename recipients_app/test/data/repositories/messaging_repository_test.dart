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
}
