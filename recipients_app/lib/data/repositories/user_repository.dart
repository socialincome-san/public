import "dart:async";

import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/demo_manager.dart";
import "package:cloud_functions/cloud_functions.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRepository {
  final UserDataSource remoteDataSource;
  final UserDataSource demoDataSource;

  final DemoManager demoManager;

  const UserRepository({required this.remoteDataSource, required this.demoDataSource, required this.demoManager});

  UserDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Stream<User?> authStateChanges() {
    final StreamController<User?> authStateController = StreamController();
    StreamSubscription<User?>? authStateSubscription;

    authStateSubscription = _activeDataSource.authStateChanges().listen((authState) {
      authStateController.add(authState);
    });

    // Start listen on demo mode changes, so we can update the authStateSubscription if the active data source is changing.
    demoManager.isDemoEnabledStream.listen((isDemoMode) {
      authStateSubscription?.cancel();

      authStateSubscription = _activeDataSource.authStateChanges().listen((authState) {
        authStateController.add(authState);
      });

      authStateController.onCancel = () {
        authStateSubscription?.cancel();
      };
    });

    return authStateController.stream;
  }

  User? get currentUser => _activeDataSource.currentUser;

  Future<Recipient?> fetchRecipient(User firebaseUser) => _activeDataSource.fetchRecipient(firebaseUser);

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
    required int? forceResendingToken,
  }) => _activeDataSource.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    onCodeSend: onCodeSend,
    onVerificationFailed: onVerificationFailed,
    onVerificationCompleted: onVerificationCompleted,
    forceResendingToken: forceResendingToken,
  );

  Future<void> signOut() {
    return _activeDataSource.signOut().whenComplete(() {
      demoManager.isDemoEnabled = false;
    });
  }

  Future<UserCredential> signInWithPhoneNumber(String phoneNumber, String otp) async {
    // Call the Cloud Function to verify OTP and get a custom token
    final result = await FirebaseFunctions.instanceFor(
      region: "europe-west6",
    ).httpsCallable("webhookTwilioVerify").call({"phoneNumber": phoneNumber, "otp": otp});

    // ignore: avoid_dynamic_calls
    final customToken = result.data["token"] as String;

    // Sign in with the custom token
    return await FirebaseAuth.instance.signInWithCustomToken(customToken);
  }

  /// Old firebase signInWithCredential method.
  @Deprecated("Use signInWithPhoneNumber instead")
  Future<void> signInWithCredential(PhoneAuthCredential credentials) =>
      _activeDataSource.signInWithCredential(credentials);

  Future<void> updateRecipient(Recipient recipient) => _activeDataSource.updateRecipient(recipient);
}
