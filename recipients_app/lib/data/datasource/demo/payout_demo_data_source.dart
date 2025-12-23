import "dart:math" as math;

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/payment/payout.dart";

class PayoutDemoDataSource implements PayoutDataSource {
  List<Payout> payments = initData();

  static List<Payout> initData() {
    final List<Payout> payments = <Payout>[];

    final nowDate = DateTime.now();
    final random = math.Random();

    final confirmedPaymentsCount = random.nextInt(12) + 1;
    final notConfirmedPaymentsCount = random.nextInt(2) + 1;

    for (int i = 0; i < confirmedPaymentsCount; i++) {
      final currentDateTime = DateTime(
        nowDate.year,
        nowDate.month - confirmedPaymentsCount - notConfirmedPaymentsCount + i,
        15,
      );
      payments.add(
        Payout(
          id: "${currentDateTime.year}-${currentDateTime.month}",
          paymentAt: currentDateTime.toIso8601String(),
          currency: Currency.sle,
          amount: 700,
          status: PayoutStatus.confirmed,
          recipientId: "123",
          createdAt: currentDateTime.toIso8601String(),
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
        Payout(
          id: "${currentDateTime.year}-${currentDateTime.month}",
          paymentAt: currentDateTime.toIso8601String(),
          currency: Currency.sle,
          amount: 700,
          status: PayoutStatus.paid,
          recipientId: "123",
          createdAt: currentDateTime.toIso8601String(),
        ),
      );
    }

    payments.sort((a, b) => a.id.compareTo(b.id));

    return payments;
  }

  @override
  Future<void> confirmPayout({required String payoutId}) async {
    final indexWhere = payments.indexWhere((element) => element.id == payoutId);
    payments[indexWhere] = payments[indexWhere].copyWith(
      status: PayoutStatus.confirmed,
    );
  }

  @override
  Future<void> contestPayout({required String payoutId, required String contestReason}) async {
    final indexWhere = payments.indexWhere((element) => element.id == payoutId);
    payments[indexWhere] = payments[indexWhere].copyWith(
      status: PayoutStatus.contested,
      comments: contestReason,
    );
  }

  @override
  Future<List<Payout>> fetchPayouts() async {
    return payments;
  }
}
