import "dart:convert";
import "dart:developer";

import "package:firebase_core/firebase_core.dart";
import "package:firebase_remote_config/firebase_remote_config.dart";
import "package:package_info_plus/package_info_plus.dart";

class FirebaseRemoteConfigService {
  final FirebaseRemoteConfig firebaseRemoteConfig = FirebaseRemoteConfig.instance;
  final appVersionInfoKey = "app_version_info";

  FirebaseRemoteConfigService();

  Future<void> init() async {
    final PackageInfo packageInfo = await PackageInfo.fromPlatform();

    try {
      await firebaseRemoteConfig.ensureInitialized();
      await firebaseRemoteConfig.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 20),
          minimumFetchInterval: const Duration(hours: 24),
        ),
      );

      await firebaseRemoteConfig.setDefaults({
        appVersionInfoKey: packageInfo.version,
      });

      await firebaseRemoteConfig.fetchAndActivate();
    } on FirebaseException catch (e, st) {
      log(
        "Unable to initialize Firebase Remote Config",
        error: e,
        stackTrace: st,
      );
    }
  }

  Future<AppVersion?> getAppVersion() async {
    final appVersionJson = firebaseRemoteConfig.getString(appVersionInfoKey);
    if (appVersionJson.isEmpty) {
      return null;
    }

    try {
      final Map<String, dynamic> jsonMap = Map<String, dynamic>.from(
        jsonDecode(appVersionJson) as Map<String, dynamic>,
      );
      return AppVersion.fromJson(jsonMap);
    } catch (e, st) {
      log(
        "Error parsing app_version_info from Remote Config: $appVersionJson",
        error: e,
        stackTrace: st,
      );
      return null;
    }
  }
}

class AppVersion {
  final String version;
  final bool isOptional;

  AppVersion({
    required this.version,
    required this.isOptional,
  });

  factory AppVersion.fromJson(Map<String, dynamic> json) {
    return AppVersion(
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
}
