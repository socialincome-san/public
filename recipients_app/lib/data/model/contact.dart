import "package:app/data/model/phone.dart";
import "package:dart_mappable/dart_mappable.dart";

part "contact.mapper.dart";

@MappableClass()
class Contact with ContactMappable {
  final String id;
  final String firstName;
  final String lastName;
  final String? callingName;
  final String? addressId;
  final String? phoneId;
  final Phone? phone;
  final String? email;
  final String? gender;
  final String? language;
  final String? dateOfBirth;
  final String? profession;
  final bool isInstitution;

  final String createdAt;
  final String? updatedAt;

  /// Returns a new [Contact] instance.
  const Contact({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.callingName,
    this.addressId,
    this.phoneId,
    this.phone,
    this.email,
    this.gender,
    this.language,
    this.dateOfBirth,
    this.profession,
    required this.isInstitution,
    required this.createdAt,
    this.updatedAt,
  });
}
