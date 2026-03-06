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
  Future<Recipient> updateRecipient(User firebaseUser, RecipientSelfUpdate selfUpdate) async {
    if (_cachedRecipient == null) throw Exception("Failed to update recipient because there is no recipient in the cache.");

    final updatedContact = _cachedRecipient!.contact.copyWith(
      firstName: selfUpdate.firstName ?? _cachedRecipient!.contact.firstName,
      lastName: selfUpdate.lastName ?? _cachedRecipient!.contact.lastName,
      callingName: selfUpdate.callingName ?? _cachedRecipient!.contact.callingName,
      gender: selfUpdate.gender ?? _cachedRecipient!.contact.gender,
      dateOfBirth: selfUpdate.dateOfBirth ?? _cachedRecipient!.contact.dateOfBirth,
      language: selfUpdate.language ?? _cachedRecipient!.contact.language,
      email: selfUpdate.email ?? _cachedRecipient!.contact.email,
      phone: selfUpdate.contactPhone != null
          ? _cachedRecipient!.contact.phone?.copyWith(number: selfUpdate.contactPhone)
          : _cachedRecipient!.contact.phone,
    );

    final updatedPaymentInformation = _cachedRecipient!.paymentInformation?.copyWith(
      mobileMoneyProvider: selfUpdate.mobileMoneyProvider ?? _cachedRecipient!.paymentInformation!.mobileMoneyProvider,
      phone: selfUpdate.paymentPhone != null
          ? _cachedRecipient!.paymentInformation!.phone.copyWith(number: selfUpdate.paymentPhone)
          : _cachedRecipient!.paymentInformation!.phone,
    );

    final newRecipient = _cachedRecipient!.copyWith(
      contact: updatedContact,
      successorName: selfUpdate.successorName ?? _cachedRecipient!.successorName,
      termsAccepted: selfUpdate.termsAccepted ?? _cachedRecipient!.termsAccepted,
      paymentInformation: updatedPaymentInformation ?? _cachedRecipient!.paymentInformation,
    );

    saveRecipient(firebaseUser, newRecipient);
    return newRecipient;
  }
}
