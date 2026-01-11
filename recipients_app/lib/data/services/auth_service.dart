import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/models/api/request_otp_request.dart";
import "package:app/data/models/api/verify_otp_request.dart";
import "package:app/data/models/api/verify_otp_response.dart";
import "package:app/demo_manager.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/foundation.dart";
import "package:http/http.dart" as http;

class AuthService {
  final FirebaseAuth firebaseAuth;
  final DemoManager demoManager;
  final http.Client _httpClient;
  static const _kBaseUrlKey = "BASE_URL";

  AuthService({
    required this.firebaseAuth,
    required this.demoManager,
    http.Client? httpClient
  }) : _httpClient = httpClient ?? http.Client();

  Future<void> verifyPhoneNumber(String phoneNumber) async {
    try {
      await _requestOtp(phoneNumber);
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(code: "failed-sent-verification-code", message: "$e");
    }
  }

  Future<void> signInWith({required String verificationCode, required String phoneNumber}) async {
    try {
      // Call the API to verify OTP and get a custom auth token
      final result = await _verifyOtp(phoneNumber, verificationCode);
      final customToken = result.customToken;
      // Sign in with the custom token
      await firebaseAuth.signInWithCustomToken(customToken);
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(code: "failed-code-verification", message: "$e");
    }
  }

  Future<void> _requestOtp(String phoneNumber) async {
    final body = RequestOtpRequest(phoneNumber: phoneNumber);

    final response = await _makeAuthenticatedRequest(
      endpoint: "api/v1/auth/request-otp",
      body: body.toJson(),
    );
    if (response.statusCode != 204) {
      throw AuthException(code: "failed-sent-verification-code", message: "Failed to request OTP: ${response.statusCode} - ${response.reasonPhrase}");
    }
  }

  Future<VerifyOtpResponse> _verifyOtp(String phoneNumber, String otp) async {
    final body = VerifyOtpRequest(phoneNumber: phoneNumber, otp: otp);

    final response = await _makeAuthenticatedRequest(
      endpoint: "api/v1/auth/verify-otp",
      body: body.toJson(),
    );
    if (response.statusCode != 200) {
      throw AuthException(code: "failed-code-verification", message: "Failed to verify OTP: ${response.statusCode} - ${response.reasonPhrase}");
    }

    return VerifyOtpResponseMapper.fromJson(response.body);
  }

  Future<http.Response> _makeAuthenticatedRequest({
    required String endpoint,
    required String body,
  }) async {
    const baseUrl = String.fromEnvironment(_kBaseUrlKey);
    if (baseUrl.isEmpty) {
      throw Exception("BASE_URL environment variable is not configured!");
    }

    final Uri uri = Uri.https(baseUrl, endpoint);
    final appCheckToken = await _getAppCheckToken();
    return await _httpClient
        .post(
          uri,
          headers: {"Content-Type": "application/json", "X-Firebase-AppCheck": appCheckToken},
          body: body,
        )
        .timeout(
          const Duration(seconds: 30),
          onTimeout: () => throw TimeoutException("Request to '$endpoint' timed out. Please try again."),
        );
  }

  Future<String> _getAppCheckToken() async {
    final appCheckToken = await FirebaseAppCheck.instance.getToken();
    if (appCheckToken == null) {
      throw AuthException(
        code: "invalid-app-check-token",
        message: "Failed to get App Check token. Can't verify user. Please try again later and update the app.",
      );
    }
    return appCheckToken;
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
    _httpClient.close();
  }
}

class AuthException implements Exception {
  final String? message;
  final String code;
  AuthException({required this.code, this.message});

  @override
  String toString() => "AuthException: code: $code ${message != null ? ", message: $message" : ""}";
}
