import "package:app/models/social_income_user.dart";
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

  /// Fetches the user data by userId from firestore and maps it to a SocialIncomeUser object
  /// Returns null if the user does not exist.
  Future<SocialIncomeUser?> fetchSocialIncomeUser(User firebaseUser) async {
    final userSnapshot =
        await firestore.collection("/recipients").doc(firebaseUser.uid).get();

    if (userSnapshot.exists && userSnapshot.data() != null) {
      return SocialIncomeUser.fromMap(userSnapshot.data()!);
    } else {
      return null;
    }
  }

  Future<void> signOut() async => firebaseAuth.signOut();
}
