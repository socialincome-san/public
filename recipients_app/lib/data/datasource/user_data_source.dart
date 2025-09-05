import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";

abstract class UserDataSource {
  User? get currentFirebaseUser;
  Future<Recipient?> fetchRecipient(User firebaseUser);
  Future<void> updateRecipient(Recipient recipient);
}
