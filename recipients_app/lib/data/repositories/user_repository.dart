import "dart:developer";

import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRepository {
  final FirebaseFirestore firestore;
  final FirebaseAuth firebaseAuth;

  const UserRepository({
    required this.firestore,
    required this.firebaseAuth,
  });

  Stream<User?> authStateChanges() => firebaseAuth.authStateChanges();
  User? get currentUser => firebaseAuth.currentUser;

  /// Fetches the user data by userId from firestore and maps it to a recipient object
  /// Returns null if the user does not exist.
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final phoneNumber = firebaseUser.phoneNumber ?? "";

    final matchingUsers = await firestore
        .collection(recipientCollection)
        .where(
          "mobile_money_phone.phone",
          isEqualTo: int.parse(phoneNumber.substring(1)),
        )
        .get();

    if (matchingUsers.docs.isEmpty) {
      return null;
    }

    final userSnapshot = matchingUsers.docs.first;

    // This doesnt work because user id from firebaseAuth is not related to user id from firestore
    // Needs to be discussed if changes should be made or not
    // final userSnapshot =
    //     await firestore.collection("/recipients").doc(firebaseUser.uid).get();

    if (userSnapshot.exists) {
      // TODO: decide if we should keep it in user object in the app at all
      final payments = await PaymentRepository(firestore: firestore)
          .fetchPayments(recipientId: userSnapshot.id);
      return Recipient.fromMap(userSnapshot.id, userSnapshot.data())
          .copyWith(payments: payments);
    } else {
      return null;
    }
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
  }) async {
    await firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (credential) async =>
          onVerificationCompleted(credential),
      verificationFailed: (ex) => onVerificationFailed(ex),
      codeSent: (verificationId, [forceResendingToken]) =>
          onCodeSend(verificationId),
      codeAutoRetrievalTimeout: (e) {
        log("auto-retrieval timeout");
      },
    );
  }

  Future<void> signOut() async => firebaseAuth.signOut();

  Future<void> signInWithCredential(PhoneAuthCredential credentials) =>
      firebaseAuth.signInWithCredential(credentials);

  Future<void> updateRecipient(Recipient recipient) async => firestore
      .collection(recipientCollection)
      .doc(recipient.userId)
      .update(recipient.toMap());
}
