import "package:animations/animations.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const String textFontFamily = "Unica77LL";

final Color siDarkBlue = Colors.lightBlue.shade900;
final Color siLightBlue = Colors.lightBlue.shade800;
const Color componentColor = Color(0xFF397FD0);
const Color backgroundColor = Color(0xFFEDF3FF);
const Color siGrey = Color(0xFFC4C4C4);
const Color siGreyText = Color(0xFF8E8E8E);

EdgeInsets edgeInsetsAll12 = const EdgeInsets.all(12);

ThemeData socialIncomeTheme = ThemeData(
  fontFamily: textFontFamily,
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
  primaryColor: AppColors.primaryColor,
  appBarTheme: AppBarTheme(backgroundColor: siDarkBlue),
  iconTheme: const IconThemeData(color: Colors.white),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      foregroundColor: AppColors.fontColor,
      backgroundColor: AppColors.primaryColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
      ),
      textStyle: AppStyles.buttonLabelBig,
      enableFeedback: true,
      elevation: 0,
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: ButtonStyle(
      minimumSize: MaterialStateProperty.all<Size>(const Size(200, 60)),
    ),
  ),
  scaffoldBackgroundColor: AppColors.backgroundColor,
  textTheme: const TextTheme(
    headline6: TextStyle(
      // This is title
      fontSize: 25,
    ),
    // Use for AppBar title
    subtitle2: TextStyle(
      // This means subtitle
      fontSize: 20,
    ),
    // Use for ListTile
    subtitle1: TextStyle(
      fontSize: 18,
    ),
    // Use in TextField
    bodyText2: TextStyle(
      // Default style
      fontSize: 16,
      fontWeight: FontWeight.normal,
    ),
    // Use for other text
    button: TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.normal,
    ), // Use for TextButton
  ),
);
