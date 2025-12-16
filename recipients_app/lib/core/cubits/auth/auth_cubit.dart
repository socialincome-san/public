import "dart:async";
import "dart:developer";

import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "auth_cubit.mapper.dart";
part "auth_state.dart";

class AuthCubit extends Cubit<AuthState> {
  final UserRepository userRepository;
  final CrashReportingRepository crashReportingRepository;
  final AuthService authService;

  late final StreamSubscription<User?> _authSubscription;
  late final StreamSubscription<User?> _idTokenChanges;

  AuthCubit({
    required this.userRepository,
    required this.crashReportingRepository,
    required this.authService,
  }) : super(const AuthState()) {
    /// Register a listener which will be triggered if the id token of the user
    /// changes for whatever reason.
    _idTokenChanges = FirebaseAuth.instance.idTokenChanges().listen((user) async {
      if (user != null) {
        final idToken = await user.getIdToken();
        log("idToken changed: $idToken");
      }
    });

    /// Register a listener which will be triggered if the auth state of the user
    /// changes for whatever reason.
    _authSubscription = authService.authStateChanges().listen((user) async {
      if (user != null) {
        try {
          final recipient = await userRepository.fetchRecipient(user);

          emit(
            AuthState(
              status: AuthStatus.authenticated,
              firebaseUser: user,
              recipient: recipient,
            ),
          );
        } on Exception catch (ex, stackTrace) {
          crashReportingRepository.logError(ex, stackTrace);
          emit(
            AuthState(
              status: AuthStatus.failure,
              exception: ex,
            ),
          );
        }
      } else {
        const AuthState();
      }
    });
  }

  /// Checks if user is logged in already.
  /// If so, emit [AuthState] with [AuthStatus.authenticated].
  /// Otherwise, emit [AuthState] with [AuthStatus.unauthenticated].
  Future<void> init() async {
    emit(const AuthState(status: AuthStatus.loading));

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

  /// Use the RecipientSelfUpdate model to update the recipient.
  Future<void> updateRecipient({required RecipientSelfUpdate selfUpdate}) async {
    emit(state.copyWith(status: AuthStatus.updatingRecipient));

    try {
      final updatedRecipient = await userRepository.updateRecipient(selfUpdate);

      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientSuccess,
          recipient: updatedRecipient,
          exception: null,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientFailure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> logout() async {
    emit(const AuthState(status: AuthStatus.loading));
    try {
      await authService.signOut();
      emit(const AuthState());
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: AuthStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  @override
  Future<void> close() {
    _authSubscription.cancel();
    _idTokenChanges.cancel();
    return super.close();
  }
}
