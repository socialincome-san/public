import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/model/recipient.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:http/http.dart" as http;

class UserRemoteDataSource implements UserDataSource {
  final String baseUrl;
  final FirebaseAuth firebaseAuth;
  final http.Client httpClient;

  const UserRemoteDataSource({
    required this.baseUrl,
    required this.firebaseAuth,
    required this.httpClient,
  });

  @override
  User? get currentFirebaseUser => firebaseAuth.currentUser;

  /// curl http://localhost:3001/api/v1/recipients/me
  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final uri = Uri.parse("$baseUrl/api/v1/recipients/me");

    final response = await httpClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch recipient: ${response.statusCode}");
    }

    return RecipientMapper.fromJson(response.body);
  }

  @override
  Future<Recipient> updateRecipient(Recipient recipient) async {
    final uri = Uri.parse("$baseUrl/api/v1/recipients/me");

    final response = await httpClient.patch(
      uri,
      body: recipient.toJson(),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to update recipient: ${response.statusCode}");
    }

    return RecipientMapper.fromJson(response.body);
  }
}

/*const String recipientCollection = "/recipients";

 class UserRemoteDataSource implements UserDataSource {
  final FirebaseFirestore firestore;
  final FirebaseAuth firebaseAuth;

  const UserRemoteDataSource({
    required this.firestore,
    required this.firebaseAuth,
  });

  @override
  User? get currentFirebaseUser => firebaseAuth.currentUser;

  /// Fetches the user data by userId from firestore and maps it to a recipient object
  /// Returns null if the user does not exist.
  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final phoneNumber = firebaseUser.phoneNumber ?? "";

    // TODO(Verena): remove this, only needed for testing
    // final token = await FirebaseAuth.instance.currentUser?.getIdToken();

    final matchingUsers = await firestore
        .collection(recipientCollection)
        .where(
          "mobile_money_phone.phone",
          isEqualTo: int.parse(phoneNumber.substring(1)),
        )
        .get();

    if (matchingUsers.docs.isEmpty) {
      return null;
    }

    final userSnapshot = matchingUsers.docs.firstOrNull;

    // This doesnt work because user id from firebaseAuth is not related to user id from firestore
    // Needs to be discussed if changes should be made or not
    // final userSnapshot =
    //     await firestore.collection("/recipients").doc(firebaseUser.uid).get();

    if (userSnapshot != null && userSnapshot.exists) {
      return RecipientMapper.fromMap(userSnapshot.data()).copyWith(
        userId: userSnapshot.id,
      );
    } else {
      return null;
    }
  }

  @override
  Future<void> updateRecipient(Recipient recipient) {
    final updatedRecipient = recipient.copyWith(updatedBy: recipient.userId);

    return firestore.collection(recipientCollection).doc(recipient.userId).update(updatedRecipient.toMap());
  }
}
 */
