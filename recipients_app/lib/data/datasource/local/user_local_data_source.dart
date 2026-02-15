import "package:app/data/database/app_database.dart" as db;
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserLocalDataSource implements UserDataSource {
  final db.AppDatabase database;

  Recipient? _cachedRecipient;

  UserLocalDataSource({required this.database});

  @override
  User? get currentFirebaseUser => null; // Local source doesn't handle Firebase users

  @override
  Recipient? get currentRecipient => _cachedRecipient;

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final recipientData = await (database.select(database.recipients)..where((r) => r.id.equals(firebaseUser.uid)))
        .getSingleOrNull();

    if (recipientData == null) {
      return null;
    }

    return _cachedRecipient = RecipientMapper.fromJson(recipientData.recipientJson);
  }

  Future<void> saveRecipient(User firebaseUser, Recipient recipient) async {
    await database.into(database.recipients).insertOnConflictUpdate(
          db.RecipientsCompanion.insert(
            id: firebaseUser.uid,
            recipientJson: recipient.toJson(),
            cachedAt: DateTime.now(),
          ),
        );
    _cachedRecipient = recipient;
  }

  Future<void> clearRecipient() async {
    await database.delete(database.recipients).go();
    _cachedRecipient = null;
  }

  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) {
    // TODO: Add queueing mechanism to sync updates to remote when back online
    throw UnimplementedError("Local source cannot update remote recipient");
  }
}
