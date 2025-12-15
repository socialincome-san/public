import "package:dart_mappable/dart_mappable.dart";

part "verify_otp_request.mapper.dart";

@MappableClass()
class VerifyOtpRequest with VerifyOtpRequestMappable {
  /// Returns a new [VerifyOtpRequest] instance.
  VerifyOtpRequest({
    required this.phoneNumber,
    required this.otp,
  });

  String phoneNumber;

  String otp;
}
