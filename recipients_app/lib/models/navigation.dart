import 'package:flutter/material.dart';

class Navigation extends ChangeNotifier {
  int selectedIndex = 1;
  String appBarTitle = "Income";

  void setIndex(int index) {
    switch (index) {
      case 0:
        appBarTitle = "Account";
        break;
      case 1:
        appBarTitle = "Income";
        break;
      case 2:
        appBarTitle = "Survey";
        break;
    }
    selectedIndex = index;
    notifyListeners();
  }
}
