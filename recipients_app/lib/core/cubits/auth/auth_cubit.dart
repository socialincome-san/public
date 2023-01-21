import "package:app/data/repositories/repositories.dart";
import "package:app/models/recipient.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "auth_state.dart";

class AuthCubit extends Cubit<AuthState> {
  final UserRepository userRepository;

  AuthCubit({
    required this.userRepository,
  }) : super(const AuthState()) {
    /// Register a listener which will be triggered if the auth state of the user
    /// changes for whatever reason.
    userRepository.authStateChanges().listen((user) async {
      if (user != null) {
        final recipient = await userRepository.fetchRecipient(user);

        emit(
          AuthState(
            status: AuthStatus.authenticated,
            firebaseUser: user,
            recipient: recipient,
          ),
        );
      } else {
        const AuthState();
      }
    });
  }

  /// Checks if user is logged in already.
  /// If so, emit [AuthState] with [AuthStatus.authenticated].
  /// Otherwise, emit [AuthState] with [AuthStatus.unauthenticated].
  Future<void> init() async {
    final user = userRepository.currentUser;

    if (user != null) {
      final recipient = await userRepository.fetchRecipient(user);

      emit(
        AuthState(
          status: AuthStatus.authenticated,
          firebaseUser: user,
          recipient: recipient,
        ),
      );
    } else {
      emit(const AuthState());
    }
  }

  Future<void> logout() async {
    await userRepository.signOut();
    emit(const AuthState());
  }
}
