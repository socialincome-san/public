import "package:flutter/material.dart";

enum SnackbarType { success, error, warning, info }

abstract class SnackbarHelper {
  const SnackbarHelper._();

  static void showSnackbar(
    BuildContext context, {
    required String message,
    SnackbarType type = SnackbarType.success,
  }) {
    // TODO add design
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
