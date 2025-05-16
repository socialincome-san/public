import "package:twilio_flutter/twilio_flutter.dart";

class TwilioService {
  late final TwilioFlutter _twilioFlutter;
  String? _verificationServiceId;

  TwilioService({
    required String accountSid,
    required String authToken,
    required String twilioNumber,
  }) {
    _twilioFlutter = TwilioFlutter(
      accountSid: accountSid,
      authToken: authToken,
      twilioNumber: twilioNumber,
    );
  }

  Future<bool> initializeVerificationService() async {
    try {
      final response = await _twilioFlutter.createVerificationService(
        serviceName: "SMS Authentication Service",
      );
      if (response.responseState == ResponseState.SUCCESS) {
        _verificationServiceId = response.metadata?["sid"] as String?;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<TwilioResponse> sendVerificationCode(String phoneNumber) async {
    if (_verificationServiceId == null) {
      final initialized = await initializeVerificationService();
      if (!initialized) throw Exception("Failed to initialize verification service");
    }

    final response = await _twilioFlutter.sendVerificationCode(
      verificationServiceId: _verificationServiceId!,
      recipient: phoneNumber,
      verificationChannel: VerificationChannel.SMS,
    );
    return response;
  }

  Future<TwilioResponse> verifyCode(String phoneNumber, String code) async {
    if (_verificationServiceId == null) throw Exception("Verification service not initialized");

    final response = await _twilioFlutter.verifyCode(
      verificationServiceId: _verificationServiceId!,
      recipient: phoneNumber,
      code: code,
    );

    return response;
  }
}
