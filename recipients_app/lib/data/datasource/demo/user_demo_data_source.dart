import "dart:async";

import "package:app/data/datasource/demo/demo_user.dart";
import "package:app/data/datasource/demo/no_op_document_reference.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/models.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserDemoDataSource implements UserDataSource {
  Recipient? _recipient = const Recipient(
    userId: "demo",
    firstName: "Demo",
    lastName: "SocialIncome",
    mobileMoneyPhone: Phone(23271118897),
    communicationMobilePhone: Phone(23271118897),
    organizationRef: NoOpDocumentReference(),
  );
  final _userStreamController = StreamController<User?>();
  late final _userBroadcastStreamController = _getBroadcastStream();
  final _user = DemoUser();

  @override
  Stream<User?> authStateChanges() {
    _userStreamController.add(_user);
    return _userBroadcastStreamController;
  }

  Stream<User?> _getBroadcastStream() {
    return _userStreamController.stream.asBroadcastStream();
  }

  @override
  User? get currentUser {
    return _user;
  }

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    return _recipient;
  }

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
    required int? forceResendingToken,
  }) async {
    // TODO do the auth flow demo as well
  }

  @override
  Future<void> signOut() async {
    _userStreamController.add(null);
  }

  @override
  Future<void> signInWithCredential(PhoneAuthCredential credentials) async {
    // TODO do the auth flow demo as well
  }

  @override
  Future<void> updateRecipient(Recipient recipient) async {
    _recipient = recipient;
  }
}
