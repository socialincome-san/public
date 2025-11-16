import "package:dart_mappable/dart_mappable.dart";

part "app_version_info.mapper.dart";

@MappableClass()
class AppVersionInfo with AppVersionInfoMappable {
  final String version;
  final bool isOptional;

  const AppVersionInfo({
    required this.version,
    required this.isOptional,
  });
}
