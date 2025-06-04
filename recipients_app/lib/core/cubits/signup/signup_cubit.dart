import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/twilio_service.dart";
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
  final UserRepository userRepository;
  final TwilioService twilioService;
  final CrashReportingRepository crashReportingRepository;

  SignupCubit({
    required this.userRepository,
    required this.twilioService,
    required this.crashReportingRepository,
  }) : super(const SignupState());

  Future<void> signupWithPhoneNumber({
    required String phoneNumber,
  }) async {
    emit(state.copyWith(status: SignupStatus.loadingPhoneNumber));

    try {
      await twilioService.sendVerificationCode(phoneNumber);
      emit(state.copyWith(status: SignupStatus.verificationSuccess, phoneNumber: phoneNumber));
    //   await userRepository.verifyPhoneNumber(
    //     phoneNumber: phoneNumber,
    //     forceResendingToken: state.forceResendingToken,
    //     onCodeSend: (verificationId, forceResendingToken) {
    //       emit(
    //         state.copyWith(
    //           status: SignupStatus.enterVerificationCode,
    //           phoneNumber: phoneNumber,
    //           forceResendingToken: forceResendingToken,
    //           verificationId: verificationId,
    //         ),
    //       );
    //     },
    //     onVerificationFailed: (ex) {
    //       crashReportingRepository.logError(ex, StackTrace.current);
    //       emit(
    //         state.copyWith(
    //           status: SignupStatus.phoneNumberFailure,
    //           exception: ex,
    //         ),
    //       );
    //     },
    //     onVerificationCompleted: (credentials) async {
    //       await userRepository.signInWithCredential(credentials);
    //       emit(
    //         state.copyWith(
    //           status: SignupStatus.verificationSuccess,
    //           phoneNumber: phoneNumber,
    //         ),
    //       );
    //     },
    //   );
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
      final phoneNumber = state.phoneNumber;

      if (phoneNumber == null) {
        emit(state.copyWith(status: SignupStatus.verificationFailure, exception: Exception("Phone number is null")));
        return;
      }

      final otp = verificationCode;

      await userRepository.signInWithPhoneNumber(phoneNumber, otp);

      // final credential = PhoneAuthProvider.credential(
      //   verificationId: state.verificationId!,
      //   smsCode: verificationCode,
      // );

      // await userRepository.signInWithCredential(credential);

      emit(
        state.copyWith(
          status: SignupStatus.verificationSuccess,
          phoneNumber: state.phoneNumber,
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

  Future<void> resendVerificationCode() =>
      signupWithPhoneNumber(phoneNumber: state.phoneNumber!);

  void changeToPhoneInput() {
    emit(
      state.copyWith(
        status: SignupStatus.enterPhoneNumber,
        phoneNumber: state.phoneNumber,
      ),
    );
  }
}
