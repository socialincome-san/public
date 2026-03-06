import "package:app/data/models/currency.dart";
import "package:dart_mappable/dart_mappable.dart";

part "country.mapper.dart";

@MappableClass()
class Country with CountryMappable {
  final String isoCode;
  final Currency currency;

  /// Returns a new [Country] instance.
  const Country({
    required this.isoCode,
    this.currency = Currency.sle, // HINT: Default to SLE for now, as we currently only have one country (Sierra Leone) in the app. We can remove this default value once we have multiple countries with different currencies.
  });
}
