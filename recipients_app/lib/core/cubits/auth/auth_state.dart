part of "auth_cubit.dart";

enum AuthStatus { unauthenticated, authenticated, failure }

class AuthState extends Equatable {
  final AuthStatus status;
  final User? firebaseUser;
  final SocialIncomeUser? socialIncomeUser;
  final Exception? exception;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.firebaseUser,
    this.socialIncomeUser,
    this.exception,
  });

  @override
  List<Object?> get props =>
      [status, firebaseUser, socialIncomeUser, exception];
}
