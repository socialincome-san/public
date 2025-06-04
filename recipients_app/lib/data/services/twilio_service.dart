import "package:twilio_flutter/twilio_flutter.dart";

class TwilioService {
  late final TwilioFlutter _twilioFlutter;
  late final String _verificationServiceId;

  TwilioService({
    required String accountSid,
    required String authToken,
    required String twilioNumber,
    required String serviceId,
  }) {
    _twilioFlutter = TwilioFlutter(accountSid: accountSid, authToken: authToken, twilioNumber: twilioNumber);
    _verificationServiceId = serviceId;
  }

  Future<TwilioResponse> sendVerificationCode(String phoneNumber) async {
    if (_verificationServiceId.isEmpty) throw Exception("Verification service not initialized");

    final response = await _twilioFlutter.sendVerificationCode(
      verificationServiceId: _verificationServiceId,
      recipient: phoneNumber,
      verificationChannel: VerificationChannel.SMS,
    );
    return response;
  }

  Future<TwilioResponse> verifyCode(String phoneNumber, String code) async {
    final response = await _twilioFlutter.verifyCode(
      verificationServiceId: _verificationServiceId,
      recipient: phoneNumber,
      code: code,
    );

    return response;
  }
}
