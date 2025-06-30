import "package:app/data/services/auth_service.dart";
import "package:cloud_functions/cloud_functions.dart";
import "package:twilio_flutter/twilio_flutter.dart";

class TwilioOtpService extends AuthService {

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

    // Call the Cloud Function to verify OTP and get a custom token
    final result = await FirebaseFunctions.instanceFor(
      region: "europe-west6",
    ).httpsCallable("webhookTwilioOtpVerification").call({"phoneNumber": _phoneNumber, "otp": _otpCode});

    // ignore: avoid_dynamic_calls
    final customToken = result.data["token"] as String;

    // Sign in with the custom token
    await firebaseAuth.signInWithCustomToken(customToken);
  }
}
