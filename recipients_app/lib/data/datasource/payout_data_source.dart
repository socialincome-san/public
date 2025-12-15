import "package:app/data/model/payout.dart";

abstract class PayoutDataSource {
  Future<List<Payout>> fetchPayouts();

  Future<void> confirmPayout({required String payoutId});

  Future<void> contestPayout({
    required String payoutId,
    required String contestReason,
  });
}
