import "package:app/data/models/organization.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";

class OrganizationRepository {
  final FirebaseFirestore firestore;
  final FirebaseAuth firebaseAuth;

  const OrganizationRepository({
    required this.firestore,
    required this.firebaseAuth,
  });

  Stream<User?> authStateChanges() => firebaseAuth.authStateChanges();
  User? get currentUser => firebaseAuth.currentUser;

  /// Fetches the user data by userId from firestore and maps it to a recipient object
  /// Returns null if the user does not exist.
  Future<Organization?> fetchOrganization(User firebaseUser) async {
    return null;
  }
}
