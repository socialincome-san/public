import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/models/payment/payout.dart";

class PayoutDemoDataSource implements PayoutDataSource {
  @override
  Future<void> confirmPayout({required String payoutId}) {
    // TODO: implement confirmPayout
    throw UnimplementedError();
  }

  @override
  Future<void> contestPayout({required String payoutId, required String contestReason}) {
    // TODO: implement contestPayout
    throw UnimplementedError();
  }

  @override
  Future<List<Payout>> fetchPayouts() {
    // TODO: implement fetchPayouts
    throw UnimplementedError();
  }
}

/* const String paymentCollection = "payments";

class PayoutDemoDataSource implements PayoutDataSource {
  List<SocialIncomePayment> payments = initData();

  static List<SocialIncomePayment> initData() {
    final List<SocialIncomePayment> payments = <SocialIncomePayment>[];

    final nowDate = DateTime.now();
    final random = Random();

    final confirmedPaymentsCount = random.nextInt(12) + 1;
    final notConfirmedPaymentsCount = random.nextInt(2) + 1;

    for (int i = 0; i < confirmedPaymentsCount; i++) {
      final currentDateTime = DateTime(
        nowDate.year,
        nowDate.month - confirmedPaymentsCount - notConfirmedPaymentsCount + i,
        15,
      );
      payments.add(
        SocialIncomePayment(
          id: "${currentDateTime.year}-${currentDateTime.month}",
          paymentAt: Timestamp.fromDate(currentDateTime),
          currency: "SLE",
          amount: 700,
          status: PaymentStatus.confirmed,
        ),
      );
    }

    for (int i = 0; i < notConfirmedPaymentsCount; i++) {
      final currentDateTime = DateTime(
        nowDate.year,
        nowDate.month - notConfirmedPaymentsCount + i,
        15,
      );
      payments.add(
        SocialIncomePayment(
          id: "${currentDateTime.year}-${currentDateTime.month}",
          paymentAt: Timestamp.fromDate(currentDateTime),
          currency: "SLE",
          amount: 700,
          status: PaymentStatus.paid,
        ),
      );
    }

    payments.sort((a, b) => a.id.compareTo(b.id));

    return payments;
  }

  @override
  Future<List<Payout>> fetchPayouts() async {
    return payments;
  }

  /// This updates the payment status to confirmed
  /// and also sets lastUpdatedAt and lastUpdatedBy to the
  /// current time and recipient
  @override
  Future<void> confirmPayout({
    required Recipient recipient,
    required SocialIncomePayment payment,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.confirmed,
      updatedBy: recipient.user.id,
    );

    final indexWhere = payments.indexWhere((element) => element.id == updatedPayment.id);
    payments[indexWhere] = updatedPayment;
  }

  @override
  Future<void> contestPayout({
    required Recipient recipient,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    final updatedPayment = payment.copyWith(
      status: PaymentStatus.contested,
      comments: contestReason,
      updatedBy: recipient.user.id,
    );

    final indexWhere = payments.indexWhere((element) => element.id == updatedPayment.id);
    payments[indexWhere] = updatedPayment;
  }
}
 */
