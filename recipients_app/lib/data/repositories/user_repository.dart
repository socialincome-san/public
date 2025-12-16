import "dart:async";

import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/models/recipient_self_update.dart";
import "package:app/demo_manager.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserDemoDataSource demoDataSource;
  final DemoManager demoManager;

  const UserRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
  });

  UserDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  User? get currentUser => _activeDataSource.currentFirebaseUser;

  Recipient? get currentRecipient => _activeDataSource.currentRecipient;

  Future<Recipient?> fetchRecipient(User firebaseUser) => _activeDataSource.fetchRecipient(firebaseUser);

  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) => _activeDataSource.updateRecipient(selfUpdate);
}
