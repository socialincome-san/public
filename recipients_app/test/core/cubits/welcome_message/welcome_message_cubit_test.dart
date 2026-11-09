import "package:app/core/cubits/welcome_message/welcome_message_cubit.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

class MockLocalUserSettingsRepository extends Mock implements LocalUserSettingsRepository {}

class MockCrashReportingRepository extends Mock implements CrashReportingRepository {}

// Only `id` is read; building a real Recipient needs its whole object graph.
// ignore: avoid_implementing_value_types
class MockRecipient extends Mock implements Recipient {}

void main() {
  const recipientId = "recipient-a";

  late MockLocalUserSettingsRepository settings;
  late MockCrashReportingRepository crashReporting;
  late MockRecipient recipient;

  setUpAll(() {
    registerFallbackValue(Exception());
    registerFallbackValue(StackTrace.empty);
  });

  setUp(() {
    settings = MockLocalUserSettingsRepository();
    crashReporting = MockCrashReportingRepository();
    recipient = MockRecipient();

    when(() => recipient.id).thenReturn(recipientId);
    when(() => crashReporting.logError(any(), any())).thenAnswer((_) async {});
    when(() => settings.setWelcomeMessagePending(pending: any(named: "pending"))).thenAnswer((_) async {});
    when(() => settings.markWelcomeMessageSeen(any())).thenAnswer((_) async {});
  });

  WelcomeMessageCubit buildCubit() => WelcomeMessageCubit(
    recipient: recipient,
    localUserSettingsRepository: settings,
    crashReportingRepository: crashReporting,
  );

  test("starts hidden", () {
    expect(buildCubit().state, isFalse);
  });

  group("load", () {
    blocTest<WelcomeMessageCubit, bool>(
      "stays hidden and leaves the flags alone when no login is pending",
      setUp: () {
        when(() => settings.isWelcomeMessagePending()).thenAnswer((_) async => false);
      },
      build: buildCubit,
      act: (cubit) => cubit.load(),
      expect: () => <bool>[],
      verify: (_) {
        verifyNever(() => settings.hasSeenWelcomeMessage(any()));
        verifyNever(() => settings.setWelcomeMessagePending(pending: any(named: "pending")));
      },
    );

    blocTest<WelcomeMessageCubit, bool>(
      "shows the message after a login when the recipient hasn't seen it",
      setUp: () {
        when(() => settings.isWelcomeMessagePending()).thenAnswer((_) async => true);
        when(() => settings.hasSeenWelcomeMessage(recipientId)).thenAnswer((_) async => false);
      },
      build: buildCubit,
      act: (cubit) => cubit.load(),
      expect: () => [true],
      verify: (_) {
        // Stays pending until dismissed, so it shows again if the app is closed first.
        verifyNever(() => settings.setWelcomeMessagePending(pending: any(named: "pending")));
      },
    );

    blocTest<WelcomeMessageCubit, bool>(
      "stays hidden and clears the pending flag when the recipient has already seen it",
      setUp: () {
        when(() => settings.isWelcomeMessagePending()).thenAnswer((_) async => true);
        when(() => settings.hasSeenWelcomeMessage(recipientId)).thenAnswer((_) async => true);
      },
      build: buildCubit,
      act: (cubit) => cubit.load(),
      expect: () => <bool>[],
      verify: (_) {
        verify(() => settings.setWelcomeMessagePending(pending: false)).called(1);
      },
    );

    blocTest<WelcomeMessageCubit, bool>(
      "stays hidden and logs the error when reading the flags fails",
      setUp: () {
        when(() => settings.isWelcomeMessagePending()).thenThrow(Exception("storage unavailable"));
      },
      build: buildCubit,
      act: (cubit) => cubit.load(),
      expect: () => <bool>[],
      verify: (_) {
        verify(() => crashReporting.logError(any(), any())).called(1);
      },
    );
  });

  group("dismiss", () {
    blocTest<WelcomeMessageCubit, bool>(
      "hides the message, marks it seen for the recipient and clears the pending flag",
      build: buildCubit,
      seed: () => true,
      act: (cubit) => cubit.dismiss(),
      expect: () => [false],
      verify: (_) {
        verify(() => settings.markWelcomeMessageSeen(recipientId)).called(1);
        verify(() => settings.setWelcomeMessagePending(pending: false)).called(1);
        verifyNever(() => crashReporting.logError(any(), any()));
      },
    );

    blocTest<WelcomeMessageCubit, bool>(
      "still hides the message and logs the error when saving fails",
      setUp: () {
        when(() => settings.markWelcomeMessageSeen(any())).thenThrow(Exception("storage unavailable"));
      },
      build: buildCubit,
      seed: () => true,
      act: (cubit) => cubit.dismiss(),
      expect: () => [false],
      verify: (_) {
        verify(() => crashReporting.logError(any(), any())).called(1);
      },
    );
  });
}
