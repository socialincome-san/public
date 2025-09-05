import "package:dart_mappable/dart_mappable.dart";

part "organization.mapper.dart";

@MappableClass()
class Organization with OrganizationMappable {
  final String name;
  final String? contactName;
  final String? contactNumber;

  const Organization({
    required this.name,
    this.contactName,
    this.contactNumber,
  });
}
