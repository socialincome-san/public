import "package:app/data/repositories/local_user_settings_repository.dart";
import "package:flutter_test/flutter_test.dart";
import "package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart";
import "package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart";

void main() {
  late LocalUserSettingsRepository repository;

  setUp(() {
    SharedPreferencesAsyncPlatform.instance = InMemorySharedPreferencesAsync.empty();
    repository = LocalUserSettingsRepository();
  });

  group("welcome message pending", () {
    test("is false by default", () async {
      expect(await repository.isWelcomeMessagePending(), isFalse);
    });

    test("can be set and cleared", () async {
      await repository.setWelcomeMessagePending(pending: true);
      expect(await repository.isWelcomeMessagePending(), isTrue);

      await repository.setWelcomeMessagePending(pending: false);
      expect(await repository.isWelcomeMessagePending(), isFalse);
    });
  });

  group("welcome message seen", () {
    test("is false by default", () async {
      expect(await repository.hasSeenWelcomeMessage("recipient-a"), isFalse);
    });

    test("is stored per recipient", () async {
      await repository.markWelcomeMessageSeen("recipient-a");

      expect(await repository.hasSeenWelcomeMessage("recipient-a"), isTrue);
      expect(await repository.hasSeenWelcomeMessage("recipient-b"), isFalse);
    });

    test("is independent of the pending flag", () async {
      await repository.markWelcomeMessageSeen("recipient-a");

      expect(await repository.isWelcomeMessagePending(), isFalse);
    });
  });
}
