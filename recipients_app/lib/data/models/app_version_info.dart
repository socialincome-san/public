import "package:dart_mappable/dart_mappable.dart";

part "app_version_info.mapper.dart";

@MappableClass()
class AppVersionInfo with AppVersionInfoMappable {
  final String version;
  @MappableField(key: "is_optional")
  final bool isOptional;

  const AppVersionInfo({
    required this.version,
    required this.isOptional,
  });
}
