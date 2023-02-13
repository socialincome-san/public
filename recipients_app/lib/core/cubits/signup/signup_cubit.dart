import "package:app/data/repositories/repositories.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
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

  SignupCubit({
    required this.userRepository,
  }) : super(const SignupState());

  Future<void> signupWithPhoneNumber({
    required String phoneNumber,
  }) async {
    emit(state.copyWith(status: SignupStatus.loadingPhoneNumber));

    try {
      await userRepository.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        onCodeSend: (verificationId) {
          emit(
            state.copyWith(
              status: SignupStatus.enterVerificationCode,
              phoneNumber: phoneNumber,
              verificationId: verificationId,
            ),
          );
        },
        onVerificationFailed: (ex) {
          emit(
            state.copyWith(
              status: SignupStatus.failure,
              exception: ex,
            ),
          );
        },
        onVerificationCompleted: (credentials) async {
          await userRepository.signInWithCredential(credentials);
          emit(
            state.copyWith(
              status: SignupStatus.verificationSuccess,
              phoneNumber: phoneNumber,
            ),
          );
        },
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: SignupStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> submitVerificationCode(String verificationCode) async {
    emit(state.copyWith(status: SignupStatus.loadingVerificationCode));

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: state.verificationId!,
        smsCode: verificationCode,
      );

      await userRepository.signInWithCredential(credential);

      emit(
        state.copyWith(
          status: SignupStatus.verificationSuccess,
          phoneNumber: state.phoneNumber,
        ),
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: SignupStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> resendVerificationCode() async {
    signupWithPhoneNumber(phoneNumber: state.phoneNumber!);
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
