import "dart:developer";

import "package:app/data/services/auth_service.dart";
import "package:firebase_auth/firebase_auth.dart";

class FirebaseOtpService extends AuthService {

  PhoneAuthCredential? _authCredential;
  int? _forceResendingToken;
  String? _verificationId;

  FirebaseOtpService({required super.firebaseAuth, required super.demoManager});

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function() onCodeSend,
    required void Function(AuthException) onVerificationFailed,
    required void Function() onVerificationCompleted,
  }) async {
    await firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      forceResendingToken: _forceResendingToken,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (credential) => _saveCredentials(credential).then((_) => onVerificationCompleted()),
      verificationFailed: (ex) => onVerificationFailed(AuthException(ex.message ?? "Verification failed")),
      codeSent: (verificationId, forceResendingToken) => _saveCodeSentDetails(verificationId, forceResendingToken).then((_)=>onCodeSend()),
      codeAutoRetrievalTimeout: (verificationId) {
        log("auto-retrieval timeout");
      },
    );
  }
  
  Future<void> _saveCredentials(PhoneAuthCredential credentials) async {
    _authCredential = credentials;
  }

  Future<void> _saveCodeSentDetails(String verificationId, int? forceResendingToken) async {
    _forceResendingToken = forceResendingToken;
    _verificationId = verificationId;
  }
  
  @override
  Future<void> submitVerificationCode(String code) {
    if (_verificationId == null) {
      throw AuthException("Verification ID is not set");
    }
    _authCredential = PhoneAuthProvider.credential(verificationId: _verificationId!, smsCode: code);
    return Future.value();
  }

  @override
  Future<void> signInWithCredential() async {
    if (_authCredential == null) {
      throw AuthException("No credentials available for sign-in");
    }
    await firebaseAuth.signInWithCredential(_authCredential!);
  }
}
