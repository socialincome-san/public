import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class PaymentRepository {
  final FirebaseFirestore firestore;

  const PaymentRepository({
    required this.firestore,
  });

  Future<List<SocialIncomePayment>> fetchPayments({
    required String recipientId,
  }) async {
    final List<SocialIncomePayment> payments = <SocialIncomePayment>[];

    final paymentsDocs = await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .get();

    for (final paymentDoc in paymentsDocs.docs) {
      payments.add(
        SocialIncomePayment.fromMap(
          paymentDoc.id,
          paymentDoc.data(),
        ),
      );
    }

    payments.sort((a, b) => b.id.compareTo(a.id));

    return payments;
  }

  Future<void> confirmPayment({
    required String recipientId,
    required SocialIncomePayment payment,
  }) async {
    final updatedPayment = payment.copyWith(
      status: "confirmed",
      confirmAt: Timestamp.fromDate(DateTime.now()),
    );

    firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(payment.id)
        .set(updatedPayment.toMap());
  }

  Future<void> contestPayment({
    required String recipientId,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    final updatedPayment = payment.copyWith(
      status: "contested",
      contestAt: Timestamp.fromDate(DateTime.now()),
      contestReason: contestReason,
    );

    firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(payment.id)
        .set(updatedPayment.toMap());
  }
}
