import "dart:async";

import "package:alchemist/alchemist.dart";
import "package:app/ui/configs/app_theme.dart";

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  const isRunningInCi = bool.fromEnvironment("CI", defaultValue: false);

  return AlchemistConfig.runWithConfig(
    config: AlchemistConfig(
      forceUpdateGoldenFiles: true,
      theme: AppTheme.lightTheme,
      platformGoldensConfig: PlatformGoldensConfig(
        enabled: !isRunningInCi,
        theme: AppTheme.lightTheme,
      ),
    ),
    run: testMain,
  );
}
