import "package:dart_mappable/dart_mappable.dart";

part "currency.mapper.dart";

@MappableEnum()
enum Currency {
  @MappableValue("SLE")
  sle,
  @MappableValue("CHF")
  chf,
  @MappableValue("EUR")
  eur,
  @MappableValue("USD")
  usd,
  @MappableValue("GBP")
  gbp,
}

extension CurrencyExtension on Currency {
  String toDisplayString() {
    return name.toUpperCase();
  }
}
