import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";

abstract class UserDataSource {
  Stream<User?> authStateChanges();
  User? get currentUser;
  Future<Recipient?> fetchRecipient(User firebaseUser);
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
    required int? forceResendingToken,
  });
  Future<void> signOut();
  Future<void> signInWithCredential(PhoneAuthCredential credentials);
  Future<void> updateRecipient(Recipient recipient);
}
