part of "auth_cubit.dart";

enum AuthStatus {
  loading,
  unauthenticated,
  authenticated,
  updatingRecipient,
  updateRecipientSuccess,
  updateRecipientFailure,
  failure,
}

@MappableClass()
class AuthState with AuthStateMappable {
  final AuthStatus status;
  final User? firebaseUser;
  final Recipient? recipient;
  final Exception? exception;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.firebaseUser,
    this.recipient,
    this.exception,
  });
}
