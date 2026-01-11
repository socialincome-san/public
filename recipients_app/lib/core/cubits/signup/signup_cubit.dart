import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

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

  Future<void> signupWithPhoneNumber({required String phoneNumber}) async {
    emit(state.copyWith(status: SignupStatus.loadingPhoneNumber));

    try {
      final result = await authService.verifyPhoneNumber(phoneNumber);
      if (result) {
        emit(
          state.copyWith(
            status: SignupStatus.enterVerificationCode,
            phoneNumber: phoneNumber,
          ),
        );
      } else {
        final error = AuthException("Failed to send verification code");
        crashReportingRepository.logError(error, StackTrace.current);
        emit(
          state.copyWith(
            status: SignupStatus.phoneNumberFailure,
            exception: error,
          ),
        );
      }
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: SignupStatus.phoneNumberFailure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> submit({required String verificationCode, required String phoneNumber}) async {
    emit(state.copyWith(status: SignupStatus.loadingVerificationCode));

    try {
      await authService.signInWith(verificationCode: verificationCode, phoneNumber: phoneNumber);
      emit(
        state.copyWith(
          status: SignupStatus.verificationSuccess,
          phoneNumber: phoneNumber,
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

  Future<void> resendVerificationCode() {
    final phoneNumber = state.phoneNumber;
    if (phoneNumber == null || phoneNumber.isEmpty) {
      emit(state.copyWith(status: SignupStatus.phoneNumberFailure));
      return Future.value();
    }
    return signupWithPhoneNumber(phoneNumber: phoneNumber);
  }

  void changeToPhoneInput() {
    emit(
      state.copyWith(
        status: SignupStatus.enterPhoneNumber,
        phoneNumber: state.phoneNumber,
      ),
    );
  }
}
