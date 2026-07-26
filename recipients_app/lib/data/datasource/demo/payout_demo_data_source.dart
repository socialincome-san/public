import "dart:math" as math;

import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/enums/payout_interval.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/models/recipient.dart";

class PayoutDemoDataSource implements PayoutDataSource {
  final Recipient _recipient;
  late List<Payout> payments;

  PayoutDemoDataSource(this._recipient) {
    payments = _initData(_recipient);
  }

  List<Payout> _initData(Recipient recipient) {
    final List<Payout> payments = <Payout>[];

    final nowDate = DateTime.now();
    final random = math.Random();

    final payoutPerInterval = recipient.program.payoutPerInterval;
    final payoutInterval = recipient.program.payoutInterval;
    final programDurationInMonths = recipient.program.programDurationInMonths;

    final intervalInMonths = _intervalInMonths(payoutInterval);

    var confirmedPaymentsCount = 0;
    var notConfirmedPaymentsCount = 0;
    var monthToSubtract = 0;

    if (payoutInterval == PayoutInterval.monthly) {
      confirmedPaymentsCount = random.nextInt(programDurationInMonths - (programDurationInMonths / 2).floor()) + 1;
      notConfirmedPaymentsCount = random.nextInt(2) + 1;
      monthToSubtract = (confirmedPaymentsCount + notConfirmedPaymentsCount) * intervalInMonths;
    } else if (payoutInterval == PayoutInterval.quarterly) {
      confirmedPaymentsCount =
          random.nextInt((programDurationInMonths / 3).floor() - ((programDurationInMonths / 3).floor() / 2).floor()) +
          1;
      notConfirmedPaymentsCount = random.nextInt(2) + 1;
      monthToSubtract = (confirmedPaymentsCount + notConfirmedPaymentsCount) * intervalInMonths;
    } else if (payoutInterval == PayoutInterval.yearly) {
      confirmedPaymentsCount =
          random.nextInt(
            (programDurationInMonths / 12).floor() - ((programDurationInMonths / 12).floor() / 2).floor(),
          ) +
          1;
      if (programDurationInMonths == 12) {
        notConfirmedPaymentsCount = 0;
      } else {
        notConfirmedPaymentsCount = random.nextInt(2) + 1;
      }
      monthToSubtract = (confirmedPaymentsCount + notConfirmedPaymentsCount) * intervalInMonths;
    }

    for (int i = 0; i < confirmedPaymentsCount + notConfirmedPaymentsCount; i++) {
      final currentDateTime = DateTime(
        nowDate.year,
        nowDate.month - (monthToSubtract-1) + (i * intervalInMonths),
        15,
      );

      if (i < confirmedPaymentsCount) {
        payments.add(
          Payout(
            id: "${currentDateTime.year}-${currentDateTime.month}",
            paymentAt: currentDateTime,
            currency: "SLE",
            amount: payoutPerInterval,
            status: PayoutStatus.confirmed,
            recipientId: "123",
            createdAt: currentDateTime,
          ),
        );
      } else {
        payments.add(
          Payout(
            id: "${currentDateTime.year}-${currentDateTime.month}",
            paymentAt: currentDateTime,
            currency: "SLE",
            amount: payoutPerInterval,
            status: PayoutStatus.paid,
            recipientId: "123",
            createdAt: currentDateTime,
          ),
        );
      }
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

int _intervalInMonths(PayoutInterval payoutInterval) {
  switch (payoutInterval) {
    case PayoutInterval.monthly:
      return 1;
    case PayoutInterval.quarterly:
      return 3;
    case PayoutInterval.yearly:
      return 12;
  }
}
