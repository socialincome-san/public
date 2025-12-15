import "package:dart_mappable/dart_mappable.dart";

part "verify_otp_response.mapper.dart";

@MappableClass()
class VerifyOtpResponse with VerifyOtpResponseMappable {
  final String customToken;
  final bool isNewUser;
  final String uid;

  const VerifyOtpResponse({
    required this.customToken,
    required this.isNewUser,
    required this.uid,
  });
}
