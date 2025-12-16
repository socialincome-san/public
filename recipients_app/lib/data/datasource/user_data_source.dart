import "package:app/data/models/recipient.dart";
import "package:app/data/models/recipient_self_update.dart";
import "package:firebase_auth/firebase_auth.dart";

abstract class UserDataSource {
  User? get currentFirebaseUser;
  Future<Recipient?> fetchRecipient(User firebaseUser);
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate);
}
