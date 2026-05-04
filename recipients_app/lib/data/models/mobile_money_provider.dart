import "package:dart_mappable/dart_mappable.dart";

part "mobile_money_provider.mapper.dart";

@MappableClass()
class MobileMoneyProvider with MobileMoneyProviderMappable {
  final String id;
  final String name;

  const MobileMoneyProvider({
    required this.id,
    required this.name,
  });
}
