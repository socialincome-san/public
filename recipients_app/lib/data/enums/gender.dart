import "package:dart_mappable/dart_mappable.dart";

part "gender.mapper.dart";

@MappableEnum()
enum Gender {
  male,
  female,
  other,
  private,
}
