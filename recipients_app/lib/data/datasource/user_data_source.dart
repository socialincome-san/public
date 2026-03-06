import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";

abstract class UserDataSource {
  Recipient? get currentRecipient;
  Future<Recipient?> fetchRecipient(User firebaseUser);
  Future<Recipient> updateRecipient(User firebaseUser, RecipientSelfUpdate selfUpdate);
}
