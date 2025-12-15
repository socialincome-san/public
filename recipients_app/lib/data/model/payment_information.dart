import "package:dart_mappable/dart_mappable.dart";

part "payment_information.mapper.dart";

@MappableClass()
class PaymentInformation with PaymentInformationMappable {
  final String id;

  // TODO: check this if it cant be paymentProvider
  final String provider;
  final String code;
  final String phoneId;

  // TODO: check this if it cant be phone
  final Object phone;

  final String createdAt;
  final String? updatedAt;

  const PaymentInformation({
    required this.id,
    required this.provider,
    required this.code,
    required this.phoneId,
    required this.phone,
    required this.createdAt,
    this.updatedAt,
  });
}
