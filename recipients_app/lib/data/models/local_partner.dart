import "package:app/core/helpers/date_time_converter.dart";
import "package:app/data/models/contact.dart";
import "package:dart_mappable/dart_mappable.dart";

part "local_partner.mapper.dart";

@MappableClass()
class LocalPartner with LocalPartnerMappable {
  final String id;
  final String name;
  final Contact? contact;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

  const LocalPartner({
    required this.id,
    required this.name,
    required this.contact,
    required this.createdAt,
    this.updatedAt,
  });
}
