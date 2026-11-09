import "package:app/core/cubits/signup/signup_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

class MockAuthService extends Mock implements AuthService {}

class MockLocalUserSettingsRepository extends Mock implements LocalUserSettingsRepository {}

class MockCrashReportingRepository extends Mock implements CrashReportingRepository {}

void main() {
  const phoneNumber = "+23212345678";
  const verificationCode = "123456";

  late MockAuthService authService;
  late MockLocalUserSettingsRepository settings;
  late MockCrashReportingRepository crashReporting;

  setUpAll(() {
    registerFallbackValue(Exception());
    registerFallbackValue(StackTrace.empty);
  });

  setUp(() {
    authService = MockAuthService();
    settings = MockLocalUserSettingsRepository();
    crashReporting = MockCrashReportingRepository();

    when(() => crashReporting.logError(any(), any())).thenAnswer((_) async {});
    when(() => settings.setWelcomeMessagePending(pending: any(named: "pending"))).thenAnswer((_) async {});
    when(
      () => authService.signInWith(
        verificationCode: any(named: "verificationCode"),
        phoneNumber: any(named: "phoneNumber"),
      ),
    ).thenAnswer((_) async {});
  });

  SignupCubit buildCubit() => SignupCubit(
    authService: authService,
    localUserSettingsRepository: settings,
    crashReportingRepository: crashReporting,
  );

  group("submit and the welcome message", () {
    test("marks the welcome message pending before signing in", () async {
      await buildCubit().submit(verificationCode: verificationCode, phoneNumber: phoneNumber);

      verifyInOrder([
        () => settings.setWelcomeMessagePending(pending: true),
        () => authService.signInWith(verificationCode: verificationCode, phoneNumber: phoneNumber),
      ]);
    });

    test("still signs in when marking the welcome message pending fails", () async {
      when(
        () => settings.setWelcomeMessagePending(pending: any(named: "pending")),
      ).thenThrow(Exception("storage unavailable"));

      final cubit = buildCubit();
      await cubit.submit(verificationCode: verificationCode, phoneNumber: phoneNumber);

      verify(() => authService.signInWith(verificationCode: verificationCode, phoneNumber: phoneNumber)).called(1);
      verify(() => crashReporting.logError(any(), any())).called(1);
      expect(cubit.state.status, SignupStatus.verificationSuccess);
    });

    test("does not touch the welcome message when the verification code is empty", () async {
      await buildCubit().submit(verificationCode: "", phoneNumber: phoneNumber);

      verifyNever(() => settings.setWelcomeMessagePending(pending: any(named: "pending")));
      verifyNever(
        () => authService.signInWith(
          verificationCode: any(named: "verificationCode"),
          phoneNumber: any(named: "phoneNumber"),
        ),
      );
    });
  });
}
