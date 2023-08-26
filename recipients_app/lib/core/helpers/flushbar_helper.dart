import "package:another_flushbar/flushbar.dart";
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
    Flushbar(
      title: title,
      message: message,
      duration: _getDuration(type),
      backgroundColor: _getBackgroundColor(type),
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: FlushbarPosition.TOP,
      titleColor: _getFontColor(type),
      messageColor: _getFontColor(type),
    )..show(context);
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
