part of "signup_cubit.dart";

enum SignupStatus {
  loadingPhoneNumber,
  loadingVerificationCode,
  phoneNumberFailure,
  enterPhoneNumber,
  enterVerificationCode,
  verificationSuccess,
  verificationFailure,
}

class SignupState extends Equatable {
  final SignupStatus status;
  final String? phoneNumber;
  final String? verificationId;
  final Exception? exception;

  const SignupState({
    this.status = SignupStatus.enterPhoneNumber,
    this.phoneNumber,
    this.verificationId,
    this.exception,
  });

  @override
  List<Object?> get props => [status, phoneNumber, verificationId, exception];

  SignupState copyWith({
    SignupStatus? status,
    String? phoneNumber,
    String? verificationId,
    Exception? exception,
  }) {
    return SignupState(
      status: status ?? this.status,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      verificationId: verificationId ?? this.verificationId,
      exception: exception ?? this.exception,
    );
  }
}
