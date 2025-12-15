import "package:app/data/model/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";

abstract class UserDataSource {
  User? get currentFirebaseUser;
  Future<Recipient?> fetchRecipient(User firebaseUser);
  Future<Recipient> updateRecipient(Recipient recipient);
}
