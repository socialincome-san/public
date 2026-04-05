import "package:app/core/helpers/date_time_converter.dart";
import "package:app/data/models/mobile_money_provider.dart";
import "package:app/data/models/phone.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payment_information.mapper.dart";

@MappableClass()
class PaymentInformation with PaymentInformationMappable {
  final String id;
  final String mobileMoneyProviderId;
  final MobileMoneyProvider mobileMoneyProvider;
  final String code;
  final String phoneId;
  final Phone phone;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

  const PaymentInformation({
    required this.id,
    required this.mobileMoneyProviderId,
    required this.mobileMoneyProvider,
    required this.code,
    required this.phoneId,
    required this.phone,
    required this.createdAt,
    this.updatedAt,
  });
}
