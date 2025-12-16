import "package:dart_mappable/dart_mappable.dart";

part "payment_provider.mapper.dart";

@MappableEnum()
enum PaymentProvider {
  orangeMoney,
  // TODO(migration): check if this still exists
  africellMoney,
}
