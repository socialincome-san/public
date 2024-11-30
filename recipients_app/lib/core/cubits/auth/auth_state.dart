part of "auth_cubit.dart";

enum AuthStatus {
  loading,
  unauthenticated,
  authenticated,
  updatingRecipient,
  updateRecipientSuccess,
  updateRecipientFailure,
  failure
}

class AuthState extends Equatable {
  final AuthStatus status;
  final User? firebaseUser;
  final Recipient? recipient;
  final Exception? exception;
  final Organization? organization;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.firebaseUser,
    this.recipient,
    this.organization,
    this.exception,
  });

  @override
  List<Object?> get props => [status, firebaseUser, recipient, exception, organization];

  AuthState copyWith({
    AuthStatus? status,
    User? firebaseUser,
    Recipient? recipient,
    Exception? exception,
    Organization? organization,
  }) {
    return AuthState(
      status: status ?? this.status,
      firebaseUser: firebaseUser ?? this.firebaseUser,
      recipient: recipient ?? this.recipient,
      exception: exception ?? this.exception,
      organization: organization ?? this.organization,
    );
  }
}
