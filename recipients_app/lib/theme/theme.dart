import 'package:animations/animations.dart';
import 'package:flutter/material.dart';

final String textFont = "Open Sans";
final Color siDarkBlue = Colors.lightBlue.shade900;
final Color siLightBlue = Colors.lightBlue.shade800;
final Color componentColor = const Color(0xFF397FD0);
final Color backgroundColor = const Color(0xFFEDF3FF);
final Color siGrey = const Color(0xFFC4C4C4);
final Color siGreyText = const Color(0xFF8E8E8E);

EdgeInsets edgeInsetsAll12 = EdgeInsets.all(12);

var socialIncomeTheme = ThemeData(
  pageTransitionsTheme: PageTransitionsTheme(
    builders: {
      TargetPlatform.android: SharedAxisPageTransitionsBuilder(
        transitionType: SharedAxisTransitionType.horizontal,
      ),
      TargetPlatform.iOS: SharedAxisPageTransitionsBuilder(
        transitionType: SharedAxisTransitionType.horizontal,
      ),
    },
  ),
  primaryColor: siDarkBlue,
  appBarTheme: AppBarTheme(backgroundColor: siDarkBlue),
  iconTheme: IconThemeData(color: Colors.white),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ButtonStyle(
      backgroundColor: MaterialStateProperty.all<Color>(siDarkBlue),
      minimumSize: MaterialStateProperty.all<Size>(Size(200, 60)),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: ButtonStyle(
      minimumSize: MaterialStateProperty.all<Size>(Size(200, 60)),
    ),
  ),
  scaffoldBackgroundColor: siGrey,
  textTheme: TextTheme(
    headline6: TextStyle(
      // This is title
      fontSize: 25,
      fontFamily: textFont,
    ),
    // Use for AppBar title
    subtitle2: TextStyle(
      // This means subtitle
      fontSize: 20,
      fontFamily: textFont,
    ),
    // Use for ListTile
    subtitle1: TextStyle(
      fontFamily: textFont,
      fontSize: 18,
    ),
    // Use in TextField
    bodyText2: TextStyle(
      // Default style
      fontSize: 16,
      fontFamily: textFont,
      fontWeight: FontWeight.normal,
    ),
    // Use for other text
    button: TextStyle(
      fontSize: 18,
      fontFamily: textFont,
      fontWeight: FontWeight.normal,
    ), // Use for TextButton
  ),
);
