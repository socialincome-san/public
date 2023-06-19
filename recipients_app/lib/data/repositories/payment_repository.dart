import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const String paymentCollection = "payments";
const String paymentUpdatedByAppUser = "app user";

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
      final payment = SocialIncomePayment.fromJson(
        paymentDoc.data(),
      );

      payments.add(payment.copyWith(id: paymentDoc.id));
    }

    payments.sort((a, b) => a.id.compareTo(b.id));

    return payments;
  }

  Future<void> confirmPayment({
    required String recipientId,
    required SocialIncomePayment payment,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.confirmed,
      updatedBy: paymentUpdatedByAppUser,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(payment.id)
        .set(updatedPayment.toJson());
  }

  Future<void> contestPayment({
    required String recipientId,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.contested,
      comments: contestReason,
      updatedBy: paymentUpdatedByAppUser,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipientId)
        .collection(paymentCollection)
        .doc(payment.id)
        .set(updatedPayment.toJson());
  }
}
