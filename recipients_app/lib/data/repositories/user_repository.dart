import "dart:async";
import "dart:io";

import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/local/app_cache_database.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/offline_exception.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/services/connectivity_service.dart";
import "package:app/demo_manager.dart";
import "package:firebase_auth/firebase_auth.dart";

const _kRecipientCacheKey = "recipient";

class UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserDemoDataSource demoDataSource;
  final DemoManager demoManager;
  final AppCacheDatabase cacheDatabase;
  final ConnectivityService connectivityService;

  const UserRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
    required this.cacheDatabase,
    required this.connectivityService,
  });

  UserDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  User? get currentUser => _activeDataSource.currentFirebaseUser;

  Stream<Recipient?> fetchRecipient(User firebaseUser) async* {
    if (demoManager.isDemoEnabled) {
      yield await demoDataSource.fetchRecipient(firebaseUser);
      return;
    }

    // Emit cached data first
    final cachedJson = await cacheDatabase.get(_kRecipientCacheKey);
    if (cachedJson != null) {
      try {
        yield RecipientMapper.fromJson(cachedJson);
      } on Exception {
        // Ignore cache deserialization errors
      }
    }

    // Then fetch from network
    try {
      final recipient = await remoteDataSource.fetchRecipient(firebaseUser);
      if (recipient != null) {
        await cacheDatabase.put(_kRecipientCacheKey, recipient.toJson());
      }
      yield recipient;
    } on SocketException {
      if (cachedJson == null) rethrow;
    } on TimeoutException {
      if (cachedJson == null) rethrow;
    } on HttpException {
      if (cachedJson == null) rethrow;
    }
  }

  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    if (!demoManager.isDemoEnabled && !connectivityService.isOnline) {
      throw OfflineMutationException();
    }

    final recipient = await _activeDataSource.updateRecipient(selfUpdate);
    if (!demoManager.isDemoEnabled) {
      await cacheDatabase.put(_kRecipientCacheKey, recipient.toJson());
    }
    return recipient;
  }
}
