import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRepository {
  late UserDataSource remoteDataSource = UserRemoteDataSource(firestore: firestore, firebaseAuth: firebaseAuth);
  late UserDataSource demoDataSource = UserDemoDataSource();

  final bool useRemoteDataSource;
  final FirebaseFirestore firestore;
  final FirebaseAuth firebaseAuth;

  UserRepository({
    required this.firestore,
    required this.firebaseAuth,
    this.useRemoteDataSource = false,
  });

  UserDataSource get _activeDataSource => useRemoteDataSource ? remoteDataSource : demoDataSource;

  Stream<User?> authStateChanges() => _activeDataSource.authStateChanges();
  User? get currentUser => _activeDataSource.currentUser;

  Future<Recipient?> fetchRecipient(User firebaseUser) => _activeDataSource.fetchRecipient(firebaseUser);

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) onCodeSend,
    required Function(FirebaseAuthException) onVerificationFailed,
    required Function(PhoneAuthCredential) onVerificationCompleted,
    required int? forceResendingToken,
  }) =>
      _activeDataSource.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        onCodeSend: onCodeSend,
        onVerificationFailed: onVerificationFailed,
        onVerificationCompleted: onVerificationCompleted,
        forceResendingToken: forceResendingToken,
      );

  Future<void> signOut() => _activeDataSource.signOut();

  Future<void> signInWithCredential(PhoneAuthCredential credentials) =>
      _activeDataSource.signInWithCredential(credentials);

  Future<void> updateRecipient(Recipient recipient) => _activeDataSource.updateRecipient(recipient);
}
