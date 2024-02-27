import "package:app/data/models/models.dart";
import "package:app/data/repositories/repositories.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const String paymentCollection = "payments";

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

  /// This updates the payment status to confirmed
  /// and also sets lastUpdatedAt and lastUpdatedBy to the
  /// current time and recipient
  Future<void> confirmPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.confirmed,
      updatedBy: recipient.userId,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipient.userId)
        .collection(paymentCollection)
        .doc(payment.id)
        .update(updatedPayment.toJson());
  }

  Future<void> contestPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.contested,
      comments: contestReason,
      updatedBy: recipient.userId,
    );

    await firestore
        .collection(recipientCollection)
        .doc(recipient.userId)
        .collection(paymentCollection)
        .doc(payment.id)
        .update(updatedPayment.toJson());
  }
}
