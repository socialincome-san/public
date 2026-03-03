import "package:app/data/datasource/demo/payout_demo_data_source.dart";
import "package:app/data/datasource/local/payout_local_data_source.dart";
import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/datasource/remote/payout_remote_data_source.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/demo_manager.dart";

class PaymentRepository {
  final PayoutRemoteDataSource remoteDataSource;
  final PayoutDemoDataSource demoDataSource;
  final PayoutLocalDataSource localDataSource;
  final DemoManager demoManager;

  const PaymentRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.localDataSource,
    required this.demoManager,
  });

  PayoutDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  /// Cache-first fetch with background refresh
  Future<void> fetchPayouts({ required Function(List<Payout>) onData}) async {
    List<Payout> cachedPayouts = [];

    // 1. Try cache first (only in non-demo mode)
      try {
        cachedPayouts = await localDataSource.fetchPayouts();
        if (cachedPayouts.isNotEmpty) {
          onData(cachedPayouts);
        }
      } catch (e) {
        // Cache read failed
      }

    // 2. Fetch fresh data
    try {
      final freshPayouts = await _activeDataSource.fetchPayouts();

      // 3. Update cache (only in non-demo mode)
      await localDataSource.savePayouts(freshPayouts);

      // 4. Notify if data changed
      if (freshPayouts != cachedPayouts) {
        onData(freshPayouts);
      }
      
      // 5. Handle case where both fresh and cached are empty - still notify with empty list
      if (freshPayouts.isEmpty && cachedPayouts.isEmpty) {
        onData([]);
      }
    } catch (e) {
      // Network failed and cached data are availble - just return
      if (cachedPayouts.isNotEmpty) {
         return;
      }
      rethrow;
    }
  }

  Future<void> confirmPayment({
    required String payoutId,
  }) async =>
      await _activeDataSource.confirmPayout(payoutId: payoutId);
  // Note: Caller should refetch to update cache

  Future<void> contestPayment({
    required String payoutId,
    required String contestReason,
  }) async =>
      await _activeDataSource.contestPayout(
        payoutId: payoutId,
        contestReason: contestReason,
      );
  // Note: Caller should refetch to update cache

  Future<void> clearCache() async {
    await localDataSource.clearPayouts();
  }
}
