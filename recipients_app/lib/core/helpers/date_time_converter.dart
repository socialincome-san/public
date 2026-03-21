import "package:dart_mappable/dart_mappable.dart";

/// A [MappingHook] that converts between ISO 8601 strings (from the API)
/// and [DateTime] objects.
class DateTimeHook extends MappingHook {
  const DateTimeHook();

  @override
  Object? beforeDecode(Object? value) {
    if (value is String) {
      return DateTime.parse(value);
    }
    return value;
  }

  @override
  Object? beforeEncode(Object? value) {
    if (value is DateTime) {
      return value.toIso8601String();
    }
    return value;
  }
}
