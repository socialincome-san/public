import "package:app/data/models/api/verify_otp_request.dart";
import "package:app/data/models/api/verify_otp_response.dart";
import "package:app/data/services/auth_service.dart";
import "package:http/http.dart" as http;
import "package:twilio_flutter/twilio_flutter.dart";

class TwilioOtpService extends AuthService {
  static const _kBaseUrlKey = "BASE_URL";
  late final TwilioFlutter _twilioFlutter;
  late final String _verificationServiceId;
  String? _phoneNumber;
  String? _otpCode;

  TwilioOtpService({
    required super.firebaseAuth, 
    required super.demoManager,
    required String accountSid,
    required String authToken,
    required String twilioNumber,
    required String serviceId,
  }) {
    _twilioFlutter = TwilioFlutter(accountSid: accountSid, authToken: authToken, twilioNumber: twilioNumber);
    _verificationServiceId = serviceId;
  }

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function() onCodeSend,
    required void Function(AuthException ex) onVerificationFailed,
    required void Function() onVerificationCompleted,
  }) async {
    if (_verificationServiceId.isEmpty) throw AuthException("Verification service not initialized");

    try {
      final response = await _twilioFlutter.sendVerificationCode(
        verificationServiceId: _verificationServiceId,
        recipient: phoneNumber,
        verificationChannel: VerificationChannel.SMS,
      );

      if (response.responseState == ResponseState.SUCCESS) {
        // Successfully sent verification code
        _phoneNumber = phoneNumber;
        onCodeSend();
      } else {
        onVerificationFailed(AuthException("Failed to send verification code: ${response.errorData?.message ?? "Unknown error"}"));
      }
    } catch (e) {
      onVerificationFailed(AuthException("Failed to send verification code. Try again later"));
      return;
    }
  }

    @override
  Future<void> submitVerificationCode(String code) async {
    if (_verificationServiceId.isEmpty) throw AuthException("Verification service not initialized");
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

    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
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
