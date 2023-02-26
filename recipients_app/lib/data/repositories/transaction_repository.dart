import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class TransactionRepository {
  final FirebaseFirestore firestore;

  const TransactionRepository({
    required this.firestore,
  });

  Future<List<SocialIncomeTransaction>> fetchTransactions({
    required String recipientId,
  }) async {
    final List<SocialIncomeTransaction> transactions =
        <SocialIncomeTransaction>[];

    final transactionDocs = await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .get();

    for (final transactionDoc in transactionDocs.docs) {
      transactions.add(
        SocialIncomeTransaction.fromMap(
          transactionDoc.id,
          transactionDoc.data(),
        ),
      );
    }

    transactions.sort((a, b) => b.id.compareTo(a.id));

    return transactions;
  }

  Future<void> confirmTransaction({
    required String recipientId,
    required SocialIncomeTransaction transaction,
  }) async {
    final updatedTransaction = transaction.copyWith(
      status: "confirmed",
      confirmAt: Timestamp.fromDate(DateTime.now()),
    );

    firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(transaction.id)
        .set(updatedTransaction.toMap());
  }

  Future<void> contestTransaction({
    required String recipientId,
    required SocialIncomeTransaction transaction,
    required String contestReason,
  }) async {
    final updatedTransaction = transaction.copyWith(
      status: "contested",
      contestAt: Timestamp.fromDate(DateTime.now()),
      contestReason: contestReason,
    );

    firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(transaction.id)
        .set(updatedTransaction.toMap());
  }
}
