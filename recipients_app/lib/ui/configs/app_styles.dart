import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

abstract class AppStyles {
  const AppStyles._();

  static const bodySmall = TextStyle(fontSize: 11, fontFamily: "Unica77LL", fontFamilyFallback: ["sans-serif"]);

  static const bodyMedium = TextStyle(fontSize: 13, fontFamily: "Unica77LL", fontFamilyFallback: ["sans-serif"]);

  static const bodyLarge = TextStyle(
    fontSize: 15,
    fontFamily: "Unica77LL",
    color: Colors.black,
    fontFamilyFallback: ["sans-serif"],
  );

  static const headlineSmall = TextStyle(fontSize: 16, fontFamily: "Unica77LL", fontFamilyFallback: ["sans-serif"]);

  static const headlineMedium = TextStyle(fontSize: 18, fontFamily: "Unica77LL", fontFamilyFallback: ["sans-serif"]);

  static const headlineLarge = TextStyle(fontSize: 24, fontFamily: "Unica77LL", fontFamilyFallback: ["sans-serif"]);

  static const iconLabel = TextStyle(
    fontSize: 13,
    fontFamily: "Unica77LL",
    color: Colors.white,
    fontFamilyFallback: ["sans-serif"],
  );

  static const buttonLabelBig = TextStyle(
    fontSize: 24,
    fontFamily: "Unica77LL",
    color: Colors.white,
    fontFamilyFallback: ["sans-serif"],
  );

  static const buttonLabelSmall = TextStyle(
    fontSize: 13,
    fontFamily: "Unica77LL",
    color: AppColors.fontColorDark,
    fontFamilyFallback: ["sans-serif"],
  );

  static const inputHint = TextStyle(
    fontSize: 15,
    fontFamily: "Unica77LL",
    color: Colors.black,
    fontFamilyFallback: ["sans-serif"],
  );

  static const inputText = TextStyle(
    fontSize: 16,
    fontFamily: "Unica77LL",
    color: AppColors.primaryColor,
    fontWeight: FontWeight.bold,
    fontFamilyFallback: ["sans-serif"],
  );
}
