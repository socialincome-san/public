import "package:app/data/model/contact.dart";
import "package:dart_mappable/dart_mappable.dart";

part "address.mapper.dart";

// TODO(migration): check if we need this
// TODO(migration): check if assumption user == contact is correct
@MappableClass()
class Address with AddressMappable {
  final String id;
  final String userId;
  final String street;
  final String number;
  final String city;
  final int zip;
  final String country;
  final Contact contact;

  const Address({
    required this.id,
    required this.userId,
    required this.street,
    required this.number,
    required this.city,
    required this.zip,
    required this.country,
    required this.contact,
  });
}
