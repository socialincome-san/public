import "dart:async";
import "dart:developer";

import "package:app/data/enums/gender.dart";
import "package:app/data/model/language_code.dart";
import "package:app/data/model/recipient.dart";
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

  Future<void> updateRecipient({
    String? firstName,
    String? lastName,
    String? callingName,
    DateTime? dateOfBirth,
    Gender? gender,
    LanguageCode? languageCode,
    String? email,
    String? communicationMobilePhone,
    // PhoneNumber? communicationMobilePhone,
    String? mobileMoneyPhone,
    // PhoneNumber? mobileMoneyPhone,
    String? paymentProvider,
    bool? termsAccepted,
    String? successorName,
  }) async {
    emit(state.copyWith(status: AuthStatus.updatingRecipient));

    // TODO(Verena):
    // how to handle paymentProvider?
    // how to handle communicationMobilePhone and mobileMoneyPhone?
    // how to handle termsAccepted?

    final recipient = state.recipient;
    final contact = recipient?.contact;

    final updatedContact = contact?.copyWith(
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth?.toIso8601String(),
      gender: gender,
      language: languageCode,
      callingName: callingName,
      // communicationMobilePhone: communicationMobilePhone,
      // mobileMoneyPhone: mobileMoneyPhone,
    );

    final updatedRecipient = recipient?.copyWith(
      contact: updatedContact,
      successorName: successorName,
    );

    if (updatedRecipient == null) {
      emit(
        state.copyWith(
          status: AuthStatus.updateRecipientFailure,
          exception: Exception("Failed to update recipient"),
        ),
      );
      return;
    }

    try {
      await userRepository.updateRecipient(updatedRecipient);

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
    await authService.signOut();
    emit(const AuthState());
  }

  @override
  Future<void> close() {
    _authSubscription.cancel();
    _idTokenChanges.cancel();
    return super.close();
  }
}
