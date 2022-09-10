import 'package:flutter/material.dart';

class AlertVisibility extends ChangeNotifier {
  bool displayVerificationCodeError = false;
  bool displayVerificationCodeCorrect = false;
  bool displayLoginError = false;
  bool displayResetEmailSent = false;
  bool displayCouldNotCreateUser = false;
  bool displayContact = false;
  bool displayIneligibleUser = false;
  bool displayFormatError = false;

  void changeAlertVisibility(bool display, String key) {
    switch (key) {
      case "CodeCorrect":
        displayVerificationCodeCorrect = display;
        break;
      case "CodeWrong":
        displayVerificationCodeError = display;
        break;
      case "LoginFail":
        displayLoginError = display;
        break;
      case "PasswordReset":
        displayResetEmailSent = display;
        break;
      case "CreateUser":
        displayCouldNotCreateUser = display;
        break;
      case "ineligible":
        displayIneligibleUser = display;
        break;
      case "formatError":
        displayFormatError = display;
        break;
    }
    notifyListeners();
  }

  void setContactVisibility(bool display) {
    displayContact = display;
    notifyListeners();
  }
}
