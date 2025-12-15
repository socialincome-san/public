import "package:dart_mappable/dart_mappable.dart";

part "verify_otp_response.mapper.dart";

@MappableClass()
class VerifyOtpResponse with VerifyOtpResponseMappable {
  /// Returns a new [VerifyOtpResponse] instance.
  VerifyOtpResponse({
    required this.customToken,
    required this.isNewUser,
    required this.uid,
  });

  String customToken;

  bool isNewUser;

  String uid;
}
