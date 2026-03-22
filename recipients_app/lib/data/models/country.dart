import "package:dart_mappable/dart_mappable.dart";

part "country.mapper.dart";

@MappableClass()
class Country with CountryMappable {
  final String isoCode;
  final String? currency;

  /// Returns a new [Country] instance.
  const Country({
    required this.isoCode,
    // TODO(migration): make it mandatory if bug on server side is fixed
    this.currency,
  });
}
