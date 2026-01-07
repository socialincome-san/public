import "package:dart_mappable/dart_mappable.dart";

part "request_otp_request.mapper.dart";

/// Request model for OTP (One-Time Password) generation.
/// 
/// Sends a phone number to the backend to receive an OTP for authentication.
@MappableClass()
class RequestOtpRequest with RequestOtpRequestMappable {
  /// The phone number to send the OTP to, including country code.
  final String phoneNumber;

  const RequestOtpRequest({
    required this.phoneNumber,
  });
}
