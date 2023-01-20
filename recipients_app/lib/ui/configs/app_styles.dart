import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

abstract class AppStyles {
  const AppStyles._();

  static const bodySmall = TextStyle(
    fontSize: 11,
    fontFamily: "Unica77LL",
  );

  static const bodyMedium = TextStyle(
    fontSize: 13,
    fontFamily: "Unica77LL",
  );

  static const bodyLarge = TextStyle(
    fontSize: 15,
    fontFamily: "Unica77LL",
  );

  static const headlineSmall = TextStyle(
    fontSize: 16,
    fontFamily: "Unica77LL",
  );

  static const headlineMedium = TextStyle(
    fontSize: 18,
    fontFamily: "Unica77LL",
  );

  static const headlineLarge = TextStyle(
    fontSize: 24,
    fontFamily: "Unica77LL",
  );

  static const iconLabel = TextStyle(
    fontSize: 13,
    fontFamily: "Unica77LL",
    color: Colors.white,
  );

  static const buttonLabelBig = TextStyle(
    fontSize: 24,
    fontFamily: "Unica77LL",
    color: Colors.white,
  );

  static const buttonLabelSmall = TextStyle(
    fontSize: 13,
    fontFamily: "Unica77LL",
    color: AppColors.fontColor,
  );
}
