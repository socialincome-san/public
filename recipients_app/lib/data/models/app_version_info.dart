import "package:equatable/equatable.dart";

class AppVersionInfo extends Equatable {
  final String version;
  final bool isOptional;

  const AppVersionInfo({
    required this.version,
    required this.isOptional,
  });

  factory AppVersionInfo.fromJson(Map<String, dynamic> json) {
    return AppVersionInfo(
      version: json["version"] as String,
      isOptional: json["is_optional"] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "version": version,
      "is_optional": isOptional,
    };
  }

  @override
  List<Object?> get props => [version, isOptional];
}
