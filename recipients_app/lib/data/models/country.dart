import "package:dart_mappable/dart_mappable.dart";

part "country.mapper.dart";

@MappableClass()
class Country with CountryMappable {
  final String isoCode;

  /// Returns a new [Country] instance.
  const Country({
    required this.isoCode,
  });
}
