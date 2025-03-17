import "dart:developer";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/recipient.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";

const String recipientCollection = "/recipients";

class UserRemoteDataSource implements UserDataSource {
  final FirebaseFirestore firestore;
  final FirebaseAuth firebaseAuth;

  const UserRemoteDataSource({
    required this.firestore,
    required this.firebaseAuth,
  });

  @override
  Stream<User?> authStateChanges() => firebaseAuth.authStateChanges();

  @override
  User? get currentUser => firebaseAuth.currentUser;


  /// Fetches the user data by userId from firestore and maps it to a recipient object
  /// Returns null if the user does not exist.
  @override
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

    final userSnapshot = matchingUsers.docs.firstOrNull;

    // This doesnt work because user id from firebaseAuth is not related to user id from firestore
    // Needs to be discussed if changes should be made or not
    // final userSnapshot =
    //     await firestore.collection("/recipients").doc(firebaseUser.uid).get();

    if (userSnapshot != null && userSnapshot.exists) {
      return Recipient.fromMap(userSnapshot.data()).copyWith(
        userId: userSnapshot.id,
      );
    } else {
      return null;
    }
  }

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
    required int? forceResendingToken,
  }) async {
    await firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      forceResendingToken: forceResendingToken,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (credential) => onVerificationCompleted(credential),
      verificationFailed: (ex) => onVerificationFailed(ex),
      codeSent: (verificationId, forceResendingToken) => onCodeSend(verificationId, forceResendingToken),
      codeAutoRetrievalTimeout: (verificationId) {
        log("auto-retrieval timeout");
      },
    );
  }

  @override
  Future<void> signOut() => firebaseAuth.signOut();

  @override
  Future<void> signInWithCredential(PhoneAuthCredential credentials) => firebaseAuth.signInWithCredential(credentials);

  @override
  Future<void> updateRecipient(Recipient recipient) async {
    final updatedRecipient = recipient.copyWith(updatedBy: recipient.userId);

    return firestore.collection(recipientCollection).doc(recipient.userId).update(updatedRecipient.toJson());
  }
}
