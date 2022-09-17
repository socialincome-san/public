import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';

// Authentication service provides methods to register, verify phone number and sign in
class AuthService {
  static AuthService _instance;
  Function verificationCompleted;
  Function verificationFailed;
  Function codeSent;
  Function codeAutoRetrievalTimeout;
  String verficationId;

  // Implementation of Singleton pattern, so all Registration components use the same instance
  static AuthService instance() {
    if (_instance == null) {
      _instance = new AuthService();
    }
    return _instance;
  }

  String get verificationId => this.verficationId;

  Future<bool> verifyPhoneNumber(String phoneNumber) async {
    FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        timeout: Duration(seconds: 60),
        verificationCompleted: verificationCompleted,
        verificationFailed: (e) {
          print("-------" + e.message);
        },
        codeSent: codeSent,
        codeAutoRetrievalTimeout: (e) {
          print("autoretrievel timeout");
        });
    return true;
  }

  void signOut() => FirebaseAuth.instance.signOut();

  Future<String> checkOTP(String verificationId, String smsCode) async {
    PhoneAuthCredential phoneCredential = PhoneAuthProvider.credential(
        verificationId: verificationId, smsCode: smsCode);
    try {
      await FirebaseAuth.instance.signInWithCredential(phoneCredential);
    } catch (e) {
      print("+" + e.code);
      return null;
    }
    return FirebaseAuth.instance.currentUser.uid;
  }

  String createdAt() {
    // catching NoSuchMethodError due to logout process on page where this method is called
    try {
      return DateFormat("dd.MM.yyyy")
          .format(FirebaseAuth.instance.currentUser.metadata.creationTime);
    } on NoSuchMethodError {
      return "";
    }
  }
}
