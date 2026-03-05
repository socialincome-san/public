import "dart:async";

import "package:app/data/database/app_database_cleaner.dart";
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
  final AppDatabaseCleaner appDatabaseCleaner;

  late final StreamSubscription<User?> _authSubscription;

  AuthCubit({
    required this.userRepository,
    required this.crashReportingRepository,
    required this.authService,
    required this.appDatabaseCleaner,
  }) : super(const AuthState()) {
    /// Register a listener which will be triggered if the auth state of the user
    /// changes for whatever reason.
    _authSubscription = authService.authStateChanges().listen((user) async {
      if (user != null) {
        try {
          await userRepository.fetchRecipient(
            firebaseUser: user,
            onData: (freshRecipient) {
              // Update UI when fresh data arrives in background
              if (freshRecipient == null) {
                emit(const AuthState(status: AuthStatus.authenticatedWithoutRecipient));
                return;
              }
              
              emit(
                AuthState(
                  status: AuthStatus.authenticated,
                  firebaseUser: user,
                  recipient: freshRecipient,
                ),
              );
            },
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
        emit(const AuthState());
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
      await userRepository.fetchRecipient(
        firebaseUser: user,
        onData: (freshRecipient) {
          // Update UI when fresh data arrives in background
          if (freshRecipient == null) {
            emit(const AuthState(status: AuthStatus.authenticatedWithoutRecipient));
            return;
          }
          emit(
            AuthState(
              status: AuthStatus.authenticated,
              firebaseUser: user,
              recipient: freshRecipient,
            ),
          );
        },
      );
    } else {
      emit(const AuthState());
    }
  }

  /// Use the RecipientSelfUpdate model to update the recipient.
  Future<void> updateRecipient({required RecipientSelfUpdate selfUpdate}) async {
    try {
      // Queue the operation (actual execution happens via UpdateQueueService)
      await userRepository.updateRecipient(selfUpdate);

      // Emit queued status to indicate operation has been queued
      // QueueEventListener will trigger init() when operation completes
      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientQueued,
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
      // Clear cache before signing out
      await appDatabaseCleaner.cleanDatabase();
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
    return super.close();
  }
}
