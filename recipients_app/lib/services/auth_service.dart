import "dart:developer";

import "package:firebase_auth/firebase_auth.dart";
import "package:intl/intl.dart";

// Authentication service provides methods to register, verify phone number and sign in
class AuthService {
  static final AuthService _instance = AuthService._();

  // Implementation of Singleton pattern, so all Registration components use the same instance
  factory AuthService() {
    return _instance;
  }

  AuthService._();

  void Function(PhoneAuthCredential)? verificationCompleted;
  void Function(String, int?)? codeSent;
  String? _verificationId;

  String? get verificationId => _verificationId;

  Future<bool> verifyPhoneNumber(String? phoneNumber) async {
    if (phoneNumber == null) {
      return false;
    }
    FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 60),
      verificationCompleted: verificationCompleted ?? (phoneAuthCredential) {},
      verificationFailed: (e) {
        log("------- ${e.message}");
      },
      codeSent: codeSent ?? (verificationId, forceResendCode) {},
      codeAutoRetrievalTimeout: (e) {
        log("auto-retrieval timeout");
      },
    );
    return true;
  }

  void signOut() => FirebaseAuth.instance.signOut();

  Future<String?> checkOTP(String? verificationId, String smsCode) async {
    if (verificationId == null) {
      return null;
    }

    final PhoneAuthCredential phoneCredential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    try {
      await FirebaseAuth.instance.signInWithCredential(phoneCredential);
    } on FirebaseAuthException catch (e) {
      log("+${e.code}");
      return null;
    } catch (e) {
      return null;
    }
    return FirebaseAuth.instance.currentUser?.uid;
  }

  String createdAt() {
    // catching NoSuchMethodError due to logout process on page where this method is called
    try {
      final creationTime =
          FirebaseAuth.instance.currentUser?.metadata.creationTime;
      if (creationTime == null) {
        return "";
      }

      return DateFormat("dd.MM.yyyy").format(creationTime);
      // ignore: avoid_catching_errors
    } on NoSuchMethodError {
      return "";
    }
  }
}
