import 'package:flutter/material.dart';

class Registration extends ChangeNotifier {
  String? phoneNumber;
  String? otp;
  String? phoneVerificationId;
  bool codeSent = false;
  bool displayVerificationCodeError = false;
  bool displayVerificationCodeCorrect = false;

  void setPhoneNumber(String? number) {
    phoneNumber = number;
    notifyListeners();
  }

  void setOtp(String oneTimePassword) {
    otp = oneTimePassword;
    notifyListeners();
  }

  void setPhoneVerificationId(String id) {
    phoneVerificationId = id;
    notifyListeners();
  }

  void toggleCodeSent() {
    codeSent = !codeSent;
    notifyListeners();
  }

  void clear() {
    phoneNumber = null;
    otp = null;
    phoneVerificationId = null;
    codeSent = false;
    notifyListeners();
  }
}
