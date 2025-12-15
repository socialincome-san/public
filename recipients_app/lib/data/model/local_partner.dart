import "package:app/data/model/contact.dart";
import "package:dart_mappable/dart_mappable.dart";

part "local_partner.mapper.dart";

@MappableClass()
class LocalPartner with LocalPartnerMappable {
  final String id;
  final String name;
  final Contact contact;

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
