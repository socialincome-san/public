import "package:app/data/models/contact.dart";
import "package:dart_mappable/dart_mappable.dart";

part "local_partner.mapper.dart";

@MappableClass()
class LocalPartner with LocalPartnerMappable {
  final String id;
  final String name;

  // TODO(migration): according to api this is not nullable,
  // but in reality I'M getting null from the backend.
  final Contact? contact;

  final String createdAt;
  final String? updatedAt;

  const LocalPartner({
    required this.id,
    required this.name,
    required this.contact,
    required this.createdAt,
    this.updatedAt,
  });
}
