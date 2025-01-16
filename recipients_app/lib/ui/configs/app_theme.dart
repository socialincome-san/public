import "package:animations/animations.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

abstract class AppTheme {
  const AppTheme._();

  static final ThemeData lightTheme = ThemeData(
    fontFamily: "Unica77LL",
    fontFamilyFallback: const ["sans-serif"],
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
      error: AppColors.redColor,
      onError: AppColors.fontColorDark,
    ),
    primaryColor: AppColors.primaryColor,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.backgroundColor,
      foregroundColor: AppColors.fontColorDark,
      titleTextStyle: AppStyles.headlineLarge.copyWith(
        color: AppColors.fontColorDark,
        fontWeight: FontWeight.bold,
      ),
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
        disabledBackgroundColor: AppColors.primaryColor.withOpacity(0.5),
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
      fillColor: Colors.white,
      filled: true,
      alignLabelWithHint: true,
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide.none,
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide.none,
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
      ),
      border: OutlineInputBorder(
        borderSide: const BorderSide(
          color: Colors.white,
        ),
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
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
    cardTheme: CardTheme(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
      ),
    ),
  );
}
