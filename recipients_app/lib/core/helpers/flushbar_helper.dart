import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

enum FlushbarType { success, error, warning, info }

abstract class FlushbarHelper {
  const FlushbarHelper._();

  static void showFlushbar(
    BuildContext context, {
    String? title,
    required String message,
    FlushbarType type = FlushbarType.success,
  }) {
    final content = title != null
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: _getFontColor(type), fontSize: 15)),
              Text(message, style: TextStyle(color: _getFontColor(type), fontSize: 15)),
            ],
          )
        : Text(message, style: TextStyle(color: _getFontColor(type), fontSize: 15));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: content,
        duration: _getDuration(type),
        backgroundColor: _getBackgroundColor(type),
        behavior: SnackBarBehavior.floating,
        dismissDirection: DismissDirection.up,
        margin: EdgeInsets.only(
          bottom: MediaQuery.of(context).size.height - 130 - MediaQuery.of(context).viewInsets.bottom,
          left: 8,
          right: 8,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  static Color _getBackgroundColor(FlushbarType type) {
    return switch (type) {
      FlushbarType.success => Colors.green,
      FlushbarType.error => AppColors.redColor,
      FlushbarType.warning => AppColors.yellowColor,
      FlushbarType.info => AppColors.primaryColor,
    };
  }

  static Color _getFontColor(FlushbarType type) {
    return switch (type) {
      FlushbarType.success => AppColors.fontColorDark,
      FlushbarType.error => AppColors.fontColorDark,
      FlushbarType.warning => AppColors.fontColorDark,
      FlushbarType.info => AppColors.fontColorLight,
    };
  }

  static Duration _getDuration(FlushbarType type) {
    return switch (type) {
      FlushbarType.success => const Duration(seconds: 3),
      FlushbarType.error => const Duration(seconds: 5),
      FlushbarType.warning => const Duration(seconds: 5),
      FlushbarType.info => const Duration(seconds: 3),
    };
  }
}
