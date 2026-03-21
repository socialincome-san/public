import "package:app/core/helpers/date_time_converter.dart";
import "package:dart_mappable/dart_mappable.dart";

part "phone.mapper.dart";

@MappableClass()
class Phone with PhoneMappable {
  final String id;
  final String number;
  final bool hasWhatsApp;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

  const Phone({
    required this.id,
    required this.number,
    required this.hasWhatsApp,
    required this.createdAt,
    this.updatedAt,
  });
}
