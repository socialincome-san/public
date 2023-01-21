part of "auth_cubit.dart";

enum AuthStatus { unauthenticated, authenticated, failure }

class AuthState extends Equatable {
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

  @override
  List<Object?> get props => [status, firebaseUser, recipient, exception];
}
