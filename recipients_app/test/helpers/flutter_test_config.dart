import "dart:async";

import "package:alchemist/alchemist.dart";
import "package:app/ui/configs/app_theme.dart";

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  //const isRunningInCi = bool.fromEnvironment("CI");

  return AlchemistConfig.runWithConfig(
    config: AlchemistConfig(
      forceUpdateGoldenFiles: true,
      theme: AppTheme.lightTheme,
      platformGoldensConfig: PlatformGoldensConfig(
        theme: AppTheme.lightTheme,
      ),
    ),
    run: testMain,
  );
}
