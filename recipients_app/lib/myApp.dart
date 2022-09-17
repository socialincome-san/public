import 'package:app/models/alertVisibility.dart';
import 'package:app/models/registration.dart';
import 'package:app/theme/theme.dart';
import 'package:app/view/pages/mainAppPage.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/currentUser.dart';
import 'view/pages/welcomePage.dart';

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    Widget start;
    if (FirebaseAuth.instance.currentUser == null)
      start = WelcomePage();
    else
      start = MainAppPage();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => Registration()),
        ChangeNotifierProvider(create: (context) => CurrentUser()),
        ChangeNotifierProvider(create: (context) => AlertVisibility())
      ],
      child: MaterialApp(
        title: 'Profile Page',
        theme: socialIncomeTheme,
        home: start,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
