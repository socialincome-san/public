import "dart:async";

import "package:app/data/datasource/local/app_cache_database.dart";
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
  final AppCacheDatabase cacheDatabase;

  late final StreamSubscription<User?> _authSubscription;
  StreamSubscription<Recipient?>? _recipientSubscription;

  AuthCubit({
    required this.userRepository,
    required this.crashReportingRepository,
    required this.authService,
    required this.cacheDatabase,
  }) : super(const AuthState()) {
    /// Register a listener which will be triggered if the auth state of the user
    /// changes for whatever reason.
    _authSubscription = authService.authStateChanges().listen((user) {
      if (user != null) {
        _listenToRecipient(user);
      } else {
        emit(const AuthState());
      }
    });
  }

  void _listenToRecipient(User user) {
    _recipientSubscription?.cancel();
    _recipientSubscription = userRepository
        .fetchRecipient(user)
        .listen(
          (recipient) {
            if (recipient == null) {
              emit(const AuthState(status: AuthStatus.authenticatedWithoutRecipient));
              return;
            }

            emit(
              AuthState(
                status: AuthStatus.authenticated,
                firebaseUser: user,
                recipient: recipient,
              ),
            );
          },
          onError: (Object ex, StackTrace stackTrace) {
            if (ex is Exception) {
              crashReportingRepository.logError(ex, stackTrace);
            }
            // Only emit failure if we don't already have a recipient
            if (state.recipient == null) {
              emit(
                AuthState(
                  status: AuthStatus.failure,
                  exception: ex is Exception ? ex : Exception(ex.toString()),
                ),
              );
            }
          },
        );
  }

  /// Checks if user is logged in already.
  /// If so, emit [AuthState] with [AuthStatus.authenticated].
  /// Otherwise, emit [AuthState] with [AuthStatus.unauthenticated].
  Future<void> init() async {
    emit(const AuthState(status: AuthStatus.loading));

    final user = userRepository.currentUser;

    if (user != null) {
      _listenToRecipient(user);
    } else {
      emit(const AuthState());
    }
  }

  /// Use the RecipientSelfUpdate model to update the recipient.
  Future<bool> updateRecipient({required RecipientSelfUpdate selfUpdate}) async {
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
      return true;
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientFailure,
          exception: ex,
        ),
      );
      return false;
    }
  }

  Future<void> logout() async {
    emit(const AuthState(status: AuthStatus.loading));
    try {
      await authService.signOut();
      await cacheDatabase.clearAll();
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
    _recipientSubscription?.cancel();
    return super.close();
  }
}
