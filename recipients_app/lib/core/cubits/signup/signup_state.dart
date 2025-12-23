part of "signup_cubit.dart";

@MappableClass()
class SignupState with SignupStateMappable {
  final SignupStatus status;
  final String? phoneNumber;
  final String? verificationId;
  final int? forceResendingToken;
  final Exception? exception;

  const SignupState({
    this.status = SignupStatus.enterPhoneNumber,
    this.phoneNumber,
    this.verificationId,
    this.forceResendingToken,
    this.exception,
  });
}

@MappableEnum()
enum SignupStatus {
  loadingPhoneNumber,
  loadingVerificationCode,
  phoneNumberFailure,
  enterPhoneNumber,
  enterVerificationCode,
  verificationSuccess,
  verificationFailure,
}
