import "dart:async";

import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/local/user_local_data_source.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:app/demo_manager.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserDemoDataSource demoDataSource;
  final UserLocalDataSource localDataSource;
  final DemoManager demoManager;

  const UserRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.localDataSource,
    required this.demoManager,
  });

  UserDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  User? get currentUser => _activeDataSource.currentFirebaseUser;

  Recipient? get currentRecipient => _activeDataSource.currentRecipient;

  /// Cache-first fetch: returns cached data immediately if available,
  /// then fetches fresh data in background via callback
  Future<Recipient?> fetchRecipient(
    User firebaseUser, {
    Function(Recipient?)? onFreshData,
  }) async {
    Recipient? cachedRecipient;

    // 1. Try to load from cache first (only in non-demo mode)
    if (!demoManager.isDemoEnabled) {
      try {
        cachedRecipient = await localDataSource.fetchRecipient(firebaseUser);
      } catch (e) {
        // Cache read failed, continue to network
      }
    }

    // 2. Fetch fresh data in background
    try {
      final freshRecipient = await _activeDataSource.fetchRecipient(firebaseUser);

      // 3. Update cache with fresh data (only in non-demo mode)
      if (!demoManager.isDemoEnabled && freshRecipient != null) {
        await localDataSource.saveRecipient(firebaseUser, freshRecipient);
      }

      // 4. Notify caller of fresh data if callback provided
      if (onFreshData != null && freshRecipient != cachedRecipient) {
        onFreshData(freshRecipient);
      }

      return freshRecipient;
    } catch (e) {
      // 5. Network failed - return cached data if available
      if (cachedRecipient != null) {
        return cachedRecipient;
      }
      rethrow; // No cache available, propagate error
    }
  }

  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    final updatedRecipient = await _activeDataSource.updateRecipient(selfUpdate);

    // Update cache after successful update
    if (!demoManager.isDemoEnabled && currentUser != null) {
      await localDataSource.saveRecipient(currentUser!, updatedRecipient);
    }

    return updatedRecipient;
  }

  Future<void> clearCache() async {
    await localDataSource.clearRecipient();
  }
}
