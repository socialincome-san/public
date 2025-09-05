import "dart:developer";
import "package:app/data/services/firebase_remote_config.dart";
import "package:app/l10n/l10n.dart";
import "package:flutter/cupertino.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:force_update_helper/force_update_helper.dart";
import "package:url_launcher/url_launcher.dart";

class AppUpdateWidget extends StatelessWidget {
  final Widget child;
  final FirebaseRemoteConfigService remoteConfigService;
  final _rootNavigatorKey = GlobalKey<NavigatorState>();

  AppUpdateWidget({
    super.key,
    required this.child,
    required this.remoteConfigService,
  });

  @override
  Widget build(BuildContext context) {
    const iosAppStoreId =
        "6444860109"; // Social Income Prod iOS app ID from App Store Connect, Staging app id is not work because the app is not publihed to the store.

    return FutureBuilder(
      future: remoteConfigService.getAppVersion(),
      builder: (context, asyncSnapshot) {
        if (asyncSnapshot.connectionState != ConnectionState.done) {
          return const SizedBox.shrink();
        }
        if (asyncSnapshot.hasError) {
          log("Error fetching remote config: ${asyncSnapshot.error}");
          return child;
        }
        if (!asyncSnapshot.hasData || asyncSnapshot.data == null) {
          log("No remote config data available");
          return child;
        }

        final appVersioninfo = asyncSnapshot.data!;

        return ForceUpdateWidget(
          navigatorKey: _rootNavigatorKey,
          showForceUpdateAlert: (context, allowCancel) => _showAlertDialog(
            context: context,
            title: context.l10n.appUpdateWidgetTitle,
            content: context.l10n.appUpdateWidgetMessage,
            showCancelButton: allowCancel,
          ),
          allowCancel: appVersioninfo.isOptional,
          showStoreListing: (storeUrl) async {
            if (await canLaunchUrl(storeUrl)) {
              await launchUrl(
                storeUrl,
                // Open app store app directly (or fallback to browser)
                mode: LaunchMode.externalApplication,
              );
            } else {
              log("Cannot launch URL: $storeUrl");
            }
          },
          onException: (e, stackTrace) {
            log(e.toString());
          },
          forceUpdateClient: ForceUpdateClient(
            // Fetch from Firebase Remote Config
            fetchRequiredVersion: () => Future.value(appVersioninfo.version),
            // To avoid mistakes, store the ID as an environment variable and read it with String.fromEnvironment
            iosAppStoreId: iosAppStoreId,
          ),
          child: child,
        );
      },
    );
  }

  Future<bool?> _showAlertDialog({
    required BuildContext context,
    required String title,
    required String content,
    bool showCancelButton = false,
    String? routeName,
  }) {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.iOS && defaultTargetPlatform != TargetPlatform.macOS) {
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
    }
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
  }
}
