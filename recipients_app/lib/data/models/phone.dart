import "package:dart_mappable/dart_mappable.dart";

part "phone.mapper.dart";

@MappableClass()
class Phone with PhoneMappable {
  final String id;
  final String number;
  final bool hasWhatsApp;
  final String createdAt;
  final String? updatedAt;

  const Phone({
    required this.id,
    required this.number,
    required this.hasWhatsApp,
    required this.createdAt,
    this.updatedAt,
  });
}
