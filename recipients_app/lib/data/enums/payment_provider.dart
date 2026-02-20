import "package:dart_mappable/dart_mappable.dart";

part "payment_provider.mapper.dart";

@MappableEnum()
enum PaymentProvider {
  @MappableValue("orange_money")
  orangeMoney,
  // TODO(migration): raphi said currently theres only orange money
  // africellMoney,
}
