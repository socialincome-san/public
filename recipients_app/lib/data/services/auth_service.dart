import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/services/api_client.dart";
import "package:app/demo_manager.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/foundation.dart";

class AuthService {
  final FirebaseAuth firebaseAuth;
  final DemoManager demoManager;
  final ApiClient apiClient;

  AuthService({
    required this.firebaseAuth,
    required this.demoManager,
    required this.apiClient,
  });

  Future<void> verifyPhoneNumber(String phoneNumber) async {
    try {
      await apiClient.requestOtp(phoneNumber);
    } catch (e) {
      throw AuthException(code: "failed-sent-verification-code", message: "Exception when calling api->requestOtp: $e");
    }
  }

  Future<void> signInWith({required String verificationCode, required String phoneNumber}) async {
    try {
      // Call the API to verify OTP and get a custom auth token
      final result = await apiClient.verifyOtp(phoneNumber, verificationCode);
      final customToken = result.customToken;
      // Sign in with the custom token
      await firebaseAuth.signInWithCustomToken(customToken);
    } catch (e) {
      throw AuthException(code: "failed-code-verification", message: "Exception when calling api->verifyOtp: $e");
    }
  }

  @nonVirtual
  Stream<User?> authStateChanges() {
    final StreamController<User?> authStateController = StreamController();
    StreamSubscription<User?>? authStateSubscription;

    authStateSubscription = _getInternalAuthStateSteam(false).listen((authState) {
      authStateController.add(authState);
    });

    // Start listen on demo mode changes:
    // If the demo mode is enabled, we will listen to the demo user stream instead of the Firebase auth state changes.
    // If the demo mode is disabled, we will listen to the Firebase auth state changes.
    // This allows the app to switch between demo mode and normal mode seamlessly.
    // When the demo mode is enabled, we will emit the demo user as the auth state.
    // When the demo mode is disabled, we will emit the Firebase auth state.
    demoManager.isDemoEnabledStream.listen((isDemoMode) {
      authStateSubscription?.cancel();

      authStateSubscription = _getInternalAuthStateSteam(isDemoMode).listen((authState) {
        authStateController.add(authState);
      });

      authStateController.onCancel = () {
        authStateSubscription?.cancel();
      };
    });

    return authStateController.stream;
  }

  final _demoUserStreamController = StreamController<User?>();
  late final _demoUserBroadcastStreamController = _getDemoUserBroadcastStream();
  final _user = DemoUser();

  Stream<User?> _getInternalAuthStateSteam(bool isDemoEnabled) {
    if (isDemoEnabled) {
      return _demoAuthStateStream();
    } else {
      return firebaseAuth.authStateChanges();
    }
  }

  Stream<User?> _demoAuthStateStream() {
    _demoUserStreamController.add(_user);
    return _demoUserBroadcastStreamController;
  }

  Stream<User?> _getDemoUserBroadcastStream() {
    return _demoUserStreamController.stream.asBroadcastStream();
  }

  @nonVirtual
  Future<void> signOut() async {
    await firebaseAuth.signOut();
    demoManager.isDemoEnabled = false;
  }

  void dispose() {
    _demoUserStreamController.close();
  }
}

class AuthException implements Exception {
  final String? message;
  final String code;
  AuthException({required this.code, this.message});

  @override
  String toString() => "AuthException: code: $code ${message != null ? ", message: $message" : ""}";
}
