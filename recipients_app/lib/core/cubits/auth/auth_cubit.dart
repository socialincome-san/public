import "package:app/data/models/organization.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "auth_state.dart";

class AuthCubit extends Cubit<AuthState> {
  final UserRepository userRepository;
  final OrganizationRepository organizationRepository;
  final CrashReportingRepository crashReportingRepository;

  AuthCubit({
    required this.userRepository,
    required this.organizationRepository,
    required this.crashReportingRepository,
  }) : super(const AuthState()) {
    /// Register a listener which will be triggered if the auth state of the user
    /// changes for whatever reason.
    userRepository.authStateChanges().listen((user) async {
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
      Organization? organization;

      if (recipient?.organizationRef != null) {
        organization = await organizationRepository
            .fetchOrganization(recipient!.organizationRef!);
      }

      emit(
        AuthState(
          status: AuthStatus.authenticated,
          firebaseUser: user,
          recipient: recipient,
          organization: organization,
        ),
      );
    } else {
      emit(const AuthState());
    }
  }

  Future<void> updateRecipient(Recipient recipient) async {
    emit(state.copyWith(status: AuthStatus.updatingRecipient));

    try {
      await userRepository.updateRecipient(recipient);

      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientSuccess,
          recipient: recipient,
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
    await userRepository.signOut();
    emit(const AuthState());
  }
}
