import "dart:async";
import "dart:convert";
import "dart:io";

import "package:app/data/datasource/demo/payout_demo_data_source.dart";
import "package:app/data/datasource/local/app_cache_database.dart";
import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/datasource/remote/payout_remote_data_source.dart";
import "package:app/data/models/offline_exception.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/services/connectivity_service.dart";
import "package:app/demo_manager.dart";

const _kPayoutsCacheKey = "payouts";

class PaymentRepository {
  final PayoutRemoteDataSource remoteDataSource;
  final PayoutDemoDataSource demoDataSource;
  final DemoManager demoManager;
  final AppCacheDatabase cacheDatabase;
  final ConnectivityService connectivityService;

  const PaymentRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
    required this.cacheDatabase,
    required this.connectivityService,
  });

  PayoutDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Stream<List<Payout>> fetchPayouts() async* {
    if (demoManager.isDemoEnabled) {
      yield await demoDataSource.fetchPayouts();
      return;
    }

    // Emit cached data first
    final cachedJson = await cacheDatabase.get(_kPayoutsCacheKey);
    if (cachedJson != null) {
      try {
        final list = jsonDecode(cachedJson) as List<dynamic>;
        yield list.map((e) => PayoutMapper.fromMap(e as Map<String, dynamic>)).toList();
      } on Exception {
        // Ignore cache deserialization errors
      }
    }

    // Then fetch from network
    try {
      final payouts = await remoteDataSource.fetchPayouts();
      final json = jsonEncode(payouts.map((e) => e.toMap()).toList());
      await cacheDatabase.put(_kPayoutsCacheKey, json);
      yield payouts;
    } on SocketException {
      if (cachedJson == null) rethrow;
    } on TimeoutException {
      if (cachedJson == null) rethrow;
    } on HttpException {
      if (cachedJson == null) rethrow;
    }
  }

  Future<void> confirmPayment({
    required String payoutId,
  }) async {
    if (!demoManager.isDemoEnabled && !connectivityService.isOnline) {
      throw OfflineMutationException();
    }
    await _activeDataSource.confirmPayout(payoutId: payoutId);
  }

  Future<void> contestPayment({
    required String payoutId,
    required String contestReason,
  }) async {
    if (!demoManager.isDemoEnabled && !connectivityService.isOnline) {
      throw OfflineMutationException();
    }
    await _activeDataSource.contestPayout(
      payoutId: payoutId,
      contestReason: contestReason,
    );
  }
}
