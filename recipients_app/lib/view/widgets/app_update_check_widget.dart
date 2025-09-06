import "dart:developer";

import "package:app/data/models/app_version_info.dart";
import "package:app/l10n/l10n.dart";
import "package:app/my_app.dart";
import "package:flutter/cupertino.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:force_update_helper/force_update_helper.dart";
import "package:url_launcher/url_launcher.dart";

// Social Income Prod iOS app ID from App Store Connect, Staging app id is not work because the app is not publihed to the store.
const iosAppStoreId = "6444860109";

class AppUpdateCheckWidget extends StatelessWidget {
  final AppVersionInfo? appVersionInfo;
  final Widget child;

  const AppUpdateCheckWidget({
    super.key,
    required this.appVersionInfo,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    if (appVersionInfo == null) {
      return child;
    }

    return ForceUpdateWidget(
      navigatorKey: rootNavigatorKey,
      showForceUpdateAlert: (context, allowCancel) => _showAlertDialog(
        context: context,
        title: context.l10n.appUpdateWidgetTitle,
        content: context.l10n.appUpdateWidgetMessage,
        showCancelButton: allowCancel,
      ),
      allowCancel: appVersionInfo!.isOptional,
      showStoreListing: (storeUrl) => _showStoreListing(context, storeUrl),
      onException: (ex, stack) => log(ex.toString()),
      forceUpdateClient: ForceUpdateClient(
        // Fetch from Firebase Remote Config
        fetchRequiredVersion: () async => appVersionInfo!.version,
        // To avoid mistakes, store the ID as an environment variable and read it with String.fromEnvironment
        iosAppStoreId: iosAppStoreId,
      ),
      child: child,
    );
  }

  Future<void> _showUserInfo(BuildContext context) async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(context.l10n.appUpdateWidgetTitle),
        content: Text(context.l10n.appUpdateWidgetErrorLaunchingStore),
        actions: [
          TextButton(
            child: Text(context.l10n.ok),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }

  Future<bool?> _showAlertDialog({
    required BuildContext context,
    required String title,
    required String content,
    bool showCancelButton = false,
    String? routeName,
  }) async {
    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return showCupertinoDialog(
          context: context,
          routeSettings: RouteSettings(name: routeName),
          builder: (context) => CupertinoAlertDialog(
            title: Text(title),
            content: Text(content),
            actions: [
              if (showCancelButton)
                CupertinoDialogAction(
                  child: Text(context.l10n.appUpdateButtonTitleLater),
                  onPressed: () => Navigator.of(context).pop(false),
                ),
              CupertinoDialogAction(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text(context.l10n.appUpdateButtonTitleUpdateNow),
              ),
            ],
          ),
        );
      case TargetPlatform.android:
        return showDialog(
          context: context,
          barrierDismissible: false,
          routeSettings: RouteSettings(name: routeName),
          builder: (context) => AlertDialog(
            title: Text(title),
            content: Text(content),
            actions: [
              if (showCancelButton)
                TextButton(
                  child: Text(context.l10n.appUpdateButtonTitleLater),
                  onPressed: () => Navigator.of(context).pop(false),
                ),
              TextButton(
                child: Text(context.l10n.appUpdateButtonTitleUpdateNow),
                onPressed: () => Navigator.of(context).pop(true),
              ),
            ],
          ),
        );
      default:
        log("Unsupported platform: $defaultTargetPlatform");
        return null;
    }
  }

  Future<void> _showStoreListing(
    BuildContext context,
    Uri storeUrl,
  ) async {
    try {
      final success = await launchUrl(
        storeUrl,
        // Open app store app directly (or fallback to browser)
        mode: LaunchMode.externalApplication,
      );

      if (!success) {
        log("Cannot launch URL: $storeUrl");
        if (!context.mounted) {
          return;
        }
        await _showUserInfo(context);
      }
    } catch (e, st) {
      log("Error launching URL: $storeUrl", error: e, stackTrace: st);
      if (!context.mounted) {
        return;
      }
      await _showUserInfo(context);
    }
  }
}
