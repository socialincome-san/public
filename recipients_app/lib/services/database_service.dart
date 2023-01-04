import "package:app/models/current_user.dart";
import "package:app/models/social_income_transaction.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class DatabaseService {
  final String phoneNumber;
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  DatabaseService(this.phoneNumber);

  Future<DocumentSnapshot> getUserSnapshot() async {
    final test = await firestore
        .collection("/recipients")
        .where(
          "mobile_money_phone.phone",
          isEqualTo: int.parse(phoneNumber.substring(1)),
        )
        .get();

    return test.docs.first;
  }

  Future<CurrentUser> fetchUserDetails(CurrentUser user) async {
    user.initialize(await getUserSnapshot());
    return user;
  }

  Future<bool> userExists() async {
    final snapshot = await getUserSnapshot();
    return snapshot.exists;
  }

  Future<void> updateOrCreateUser(CurrentUser user) async {
    final snapshot = await getUserSnapshot();
    snapshot.reference.set(user.data());
  }

  Future<List<SocialIncomeTransaction>> fetchTransactionDetails() async {
    final List<SocialIncomeTransaction> transactions =
        <SocialIncomeTransaction>[];
    final snapshot = await getUserSnapshot();

    final transactionDocs = await firestore
        .collection("/recipients")
        .doc(snapshot.id)
        .collection("payments")
        .get();

    for (final element in transactionDocs.docs) {
      final transaction = SocialIncomeTransaction();
      transaction.initialize(element.data(), element.id);
      transactions.add(transaction);
    }

    transactions.sort((a, b) {
      final aId = a.id;
      final bId = b.id;

      return aId != null && bId != null ? bId.compareTo(aId) : 0;
    });

    return transactions;
  }

  Future<void> updateUser(Map<String, Object?> info) async {
    final userSnapshot = await getUserSnapshot();
    return userSnapshot.reference.update(info);
  }

  Future<void> updateTransaction(
    Map<String, Object?> info,
    String transactionId,
  ) async {
    final snapshot = await getUserSnapshot();

    await firestore
        .collection("/recipients")
        .doc(snapshot.id)
        .collection("payments")
        .doc(transactionId)
        .update(info);
  }

  Future<void> updateNextSurvey(DateTime date) async {
    final snapshot = await getUserSnapshot();

    await firestore
        .collection("/recipients")
        .doc(snapshot.id)
        .update({"next_survey": date});
  }
}
