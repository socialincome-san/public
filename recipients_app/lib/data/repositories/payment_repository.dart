import "package:app/data/datasource/demo/payout_demo_data_source.dart";
import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/datasource/remote/payment_remote_data_source.dart";
import "package:app/data/model/payout.dart";
import "package:app/demo_manager.dart";

class PaymentRepository {
  final PayoutRemoteDataSource remoteDataSource;
  final PayoutDemoDataSource demoDataSource;

  final DemoManager demoManager;

  const PaymentRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
  });

  PayoutDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Future<List<Payout>> fetchPayouts() => _activeDataSource.fetchPayouts();

  Future<void> confirmPayment({
    required String payoutId,
  }) async => await _activeDataSource.confirmPayout(payoutId: payoutId);

  Future<void> contestPayment({
    required String payoutId,
    required String contestReason,
  }) async => await _activeDataSource.contestPayout(
    payoutId: payoutId,
    contestReason: contestReason,
  );
}
