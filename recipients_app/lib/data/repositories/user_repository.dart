import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
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
  final FirebaseAuth firebaseAuth;

  const UserRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.localDataSource,
    required this.demoManager,
    required this.firebaseAuth
  });

  UserDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  User? get currentUser => demoManager.isDemoEnabled ? DemoUser() : firebaseAuth.currentUser;

  Recipient? get currentRecipient => _activeDataSource.currentRecipient;

  /// Cache-first fetch: returns cached data immediately if available,
  /// then fetches fresh data in background via callback
  Future<void> fetchRecipient({
    required User firebaseUser, 
    required Function(Recipient?) onData,
  }) async {
    Recipient? cachedRecipient;

    // 1. Try to load from cache first
    try {
      cachedRecipient = await localDataSource.fetchRecipient(firebaseUser);
      if (cachedRecipient != null) {
        onData(cachedRecipient);
      }
    } catch (e) {
      // Cache read failed, continue to network
    }

    // 2. Fetch fresh data in background
    try {
      final freshRecipient = await _activeDataSource.fetchRecipient(firebaseUser);

      // 3. Update cache with fresh data
      if (freshRecipient != null) {
        await localDataSource.saveRecipient(firebaseUser, freshRecipient);
      }

      // 4. Notify caller of fresh data if callback provided
      if (freshRecipient != cachedRecipient) {
        onData(freshRecipient);
      } 
      
      // 5. Handle case where both fresh and cached are null - still notify with null
      if (freshRecipient == null && cachedRecipient == null) {
        onData(null);
      }
    } catch (e) {
      if (cachedRecipient != null) {
         return;
      }
      rethrow;
    }
  }

  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    if (currentUser != null) {
      final updatedRecipient = await _activeDataSource.updateRecipient(currentUser!, selfUpdate);
      // Update cache after successful update
      await localDataSource.saveRecipient(currentUser!, updatedRecipient);
      return updatedRecipient;
    } else {
      throw Exception("No authenticated user found.");
    }
  }

  Future<void> clearCache() async {
    await localDataSource.clearRecipient();
  }
}
