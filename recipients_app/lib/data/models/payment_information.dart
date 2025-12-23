import "package:app/data/enums/payment_provider.dart";
import "package:app/data/models/phone.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payment_information.mapper.dart";

@MappableClass()
class PaymentInformation with PaymentInformationMappable {
  final String id;

  final PaymentProvider provider;
  final String code;
  final String phoneId;

  final Phone phone;

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
