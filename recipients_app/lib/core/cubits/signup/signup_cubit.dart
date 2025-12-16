import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "signup_cubit.mapper.dart";
part "signup_state.dart";

// TODO add errors while signing up
/* void changeAlertVisibility(bool display, String key) {
    switch (key) {
      case "CodeCorrect":
      case "CodeWrong":
      case "LoginFail":
      case "PasswordReset":
      case "CreateUser":
      case "ineligible":
      case "formatError":
    } */

class SignupCubit extends Cubit<SignupState> {
  final AuthService authService;
  final CrashReportingRepository crashReportingRepository;

  SignupCubit({
    required this.crashReportingRepository,
    required this.authService,
  }) : super(const SignupState());

  Future<void> signupWithPhoneNumber({
    required String phoneNumber,
  }) async {
    emit(state.copyWith(status: SignupStatus.loadingPhoneNumber));

    try {
      await authService.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        onCodeSend: () {
          emit(
            state.copyWith(
              status: SignupStatus.enterVerificationCode,
              phoneNumber: phoneNumber,
              exception: null,
            ),
          );
        },
        onVerificationFailed: (ex) {
          crashReportingRepository.logError(ex, StackTrace.current);
          emit(
            state.copyWith(
              status: SignupStatus.phoneNumberFailure,
              exception: ex,
            ),
          );
        },
        onVerificationCompleted: () async {
          try {
            await authService.signInWithCredential();
            emit(
              state.copyWith(
                status: SignupStatus.verificationSuccess,
                phoneNumber: phoneNumber,
                exception: null,
              ),
            );
          } on Exception catch (ex, stackTrace) {
            crashReportingRepository.logError(ex, stackTrace);
            emit(
              state.copyWith(
                status: SignupStatus.verificationFailure,
                exception: ex,
              ),
            );
          }
        },
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: SignupStatus.verificationFailure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> submitVerificationCode(String verificationCode) async {
    emit(state.copyWith(status: SignupStatus.loadingVerificationCode));

    try {
      await authService.submitVerificationCode(verificationCode);
      await authService.signInWithCredential();

      emit(
        state.copyWith(
          status: SignupStatus.verificationSuccess,
          phoneNumber: state.phoneNumber,
          exception: null,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: SignupStatus.verificationFailure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> resendVerificationCode() => signupWithPhoneNumber(phoneNumber: state.phoneNumber!);

  void changeToPhoneInput() {
    emit(
      state.copyWith(
        status: SignupStatus.enterPhoneNumber,
        phoneNumber: state.phoneNumber,
        exception: null,
      ),
    );
  }
}
