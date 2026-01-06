import "package:app/data/models/api/request_otp_request.dart";
import "package:app/data/models/api/verify_otp_request.dart";
import "package:app/data/models/api/verify_otp_response.dart";
import "package:app/data/services/auth_service.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:http/http.dart" as http;

class TwilioOtpService extends AuthService {
  static const _kBaseUrlKey = "BASE_URL";
  String? _phoneNumber;
  String? _otpCode;

  TwilioOtpService({
    required super.firebaseAuth, 
    required super.demoManager,
  });

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function() onCodeSend,
    required void Function(AuthException ex) onVerificationFailed,
    required void Function() onVerificationCompleted,
  }) async {

    try {
      final success = await requestOtp(phoneNumber);
      if (success) {
        // Successfully sent verification code
        _phoneNumber = phoneNumber;
        onCodeSend();
      } else {
        onVerificationFailed(AuthException("Failed to send verification code"));
      }
    } catch (e) {
      onVerificationFailed(AuthException("Failed to send verification code. Try again later"));
      return;
    }
  }

    @override
  Future<void> submitVerificationCode(String code) async {
    if (_phoneNumber == null) throw AuthException("Verification service not initialized");
    if (code.isEmpty) throw AuthException("OTP code cannot be empty");
    // Successfully verified OTP code
    _otpCode = code;
  }

  @override
  Future<void> signInWithCredential() async {
    if (_otpCode == null) {
      throw AuthException("OTP code not set – call submitVerificationCode first");
    }

    if (_phoneNumber == null) {
      throw AuthException("Phone number not set – call verifyPhoneNumber first");
    }

    try {
      // Call the API to verify OTP and get a custom token
      final result = await verifyOtp(_phoneNumber!, _otpCode!);
      final customToken = result.customToken;
      // Sign in with the custom token
      await firebaseAuth.signInWithCustomToken(customToken);
    } catch (e) {
      throw AuthException("Failed to verify OTP: $e");
    }
  }

  Future<bool> requestOtp(String phoneNumber) async {
    const baseUrl = String.fromEnvironment(_kBaseUrlKey);
    if (baseUrl.isEmpty) {
      throw AuthException("BASE_URL environment variable is not configured!");
    }

    final Uri uri = Uri.https(
      baseUrl,
      "api/v1/auth/request-otp",
    );

    final body = RequestOtpRequest(
      phoneNumber: phoneNumber,
    );

    final appCheckToken = await FirebaseAppCheck.instance.getToken();
    if (appCheckToken == null) {
      throw AuthException("Failed to get App Check token. Can't verify OTP. Please try again later or update the app.");
    }

    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json", "X-Firebase-AppCheck": appCheckToken},
      body: body.toJson(),
    ).timeout(
      const Duration(seconds: 30),
      onTimeout: () => throw AuthException("Request timed out. Please try again."),
    );

    if (response.statusCode != 204) {
      throw AuthException("Failed to request OTP: ${response.statusCode}");
    }

    return true;
  }

  Future<VerifyOtpResponse> verifyOtp(String phoneNumber, String otp) async {
    const baseUrl = String.fromEnvironment(_kBaseUrlKey);
    if (baseUrl.isEmpty) {
      throw AuthException("BASE_URL environment variable is not configured!");
    }

    final Uri uri = Uri.https(
      baseUrl,
      "api/v1/auth/verify-otp",
    );

    final body = VerifyOtpRequest(
      phoneNumber: phoneNumber,
      otp: otp,
    );

    final appCheckToken = await FirebaseAppCheck.instance.getToken();
    if (appCheckToken == null) {
      throw AuthException("Failed to get App Check token. Can't verify OTP. Please try again later or update the app.");
    }

    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json", "X-Firebase-AppCheck": appCheckToken},
      body: body.toJson(),
    ).timeout(
      const Duration(seconds: 30),
      onTimeout: () => throw AuthException("Request timed out. Please try again."),
    );

    if (response.statusCode != 200) {
      throw AuthException("Failed to verify OTP: ${response.statusCode}");
    }

    return VerifyOtpResponseMapper.fromJson(response.body);
  }
}
