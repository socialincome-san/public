import "package:animations/animations.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

abstract class AppTheme {
  const AppTheme._();

  static final ThemeData lightTheme = ThemeData(
    fontFamily: "Unica77LL",
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: SharedAxisPageTransitionsBuilder(
          transitionType: SharedAxisTransitionType.horizontal,
        ),
        TargetPlatform.iOS: SharedAxisPageTransitionsBuilder(
          transitionType: SharedAxisTransitionType.horizontal,
        ),
      },
    ),
    colorScheme: const ColorScheme.light(
      primary: AppColors.primaryColor,
      secondary: AppColors.primaryColor,
      surface: AppColors.primaryLightColor,
      background: AppColors.backgroundColor,
      error: AppColors.redColor,
      onPrimary: AppColors.fontColorLight,
      onError: AppColors.fontColorDark,
    ),
    primaryColor: AppColors.primaryColor,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.primaryColor,
      foregroundColor: AppColors.fontColorLight,
      titleTextStyle: AppStyles.headlineMedium,
    ),
    iconTheme: const IconThemeData(color: Colors.white),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primaryColor,
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
          side: const BorderSide(
            color: AppColors.primaryColor,
            width: 3,
          ),
        ),
        textStyle: AppStyles.buttonLabelBig,
        enableFeedback: true,
        elevation: 0,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: AppColors.primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
        ),
        textStyle: AppStyles.buttonLabelBig,
        enableFeedback: true,
        elevation: 0,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      hintStyle: AppStyles.inputHint,
      border: OutlineInputBorder(
        borderSide: const BorderSide(
          color: AppColors.primaryLightColor,
        ),
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
      ),
    ),
    scaffoldBackgroundColor: AppColors.backgroundColor,
    textTheme: const TextTheme(
      bodySmall: AppStyles.bodySmall,
      bodyMedium: AppStyles.bodyMedium,
      bodyLarge: AppStyles.bodyLarge,
      headlineSmall: AppStyles.headlineSmall,
      headlineMedium: AppStyles.headlineMedium,
      headlineLarge: AppStyles.headlineLarge,
    ),
  );
}
