import "dart:convert";
import "dart:developer";

import "package:app/data/models/app_version_info.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:firebase_core/firebase_core.dart";
import "package:firebase_remote_config/firebase_remote_config.dart";
import "package:package_info_plus/package_info_plus.dart";

const _appVersionInfoKey = "app_version_info";

class FirebaseRemoteConfigService {
  final FirebaseRemoteConfig firebaseRemoteConfig;
  final PackageInfo packageInfo;
  final CrashReportingRepository crashReportingRepository;
  final Duration minimumFetchInterval;

  const FirebaseRemoteConfigService({
    required this.firebaseRemoteConfig,
    required this.packageInfo,
    required this.crashReportingRepository,
    this.minimumFetchInterval = const Duration(hours: 1),
  });

  Future<void> init() async {
    try {
      await firebaseRemoteConfig.ensureInitialized();
      await firebaseRemoteConfig.setConfigSettings(
        RemoteConfigSettings(
          fetchTimeout: const Duration(seconds: 20),
          minimumFetchInterval: minimumFetchInterval,
        ),
      );

      await firebaseRemoteConfig.setDefaults({
        _appVersionInfoKey: jsonEncode(
          AppVersionInfo(
            version: packageInfo.version,
            isOptional: true, // default = no forced update
          ).toJson(),
        ),
      });

      await firebaseRemoteConfig.fetchAndActivate();
    } on FirebaseException catch (ex, stack) {
      log(
        "Unable to initialize Firebase Remote Config",
        error: ex,
        stackTrace: stack,
      );
      crashReportingRepository.logError(ex, stack);
    }
  }

  Future<AppVersionInfo?> getAppVersionInfo() async {
    final appVersionJson = firebaseRemoteConfig.getString(_appVersionInfoKey);
    if (appVersionJson.isEmpty) {
      return null;
    }

    try {
      final jsonMap = Map<String, dynamic>.from(
        jsonDecode(appVersionJson) as Map<String, dynamic>,
      );

      return AppVersionInfoMapper.fromMap(jsonMap);
    } catch (ex, stack) {
      log(
        "Error parsing app_version_info from Remote Config: $appVersionJson",
        error: ex,
        stackTrace: stack,
      );

      crashReportingRepository.logError(Exception(ex.toString()), stack);
      return null;
    }
  }
}
