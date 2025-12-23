import "package:dart_mappable/dart_mappable.dart";

part "verify_otp_request.mapper.dart";

@MappableClass()
class VerifyOtpRequest with VerifyOtpRequestMappable {
  final String phoneNumber;
  final String otp;

  const VerifyOtpRequest({
    required this.phoneNumber,
    required this.otp,
  });
}
