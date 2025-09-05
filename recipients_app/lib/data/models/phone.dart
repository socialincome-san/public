import "package:dart_mappable/dart_mappable.dart";

part "phone.mapper.dart";

@MappableClass()
class Phone with PhoneMappable {
  // @JsonKey(name: "phone", defaultValue: 0)
  final int phoneNumber;

  const Phone(this.phoneNumber);
}
