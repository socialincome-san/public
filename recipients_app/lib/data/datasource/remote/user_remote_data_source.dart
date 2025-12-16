import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/models/recipient_self_update.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRemoteDataSource implements UserDataSource {
  final Uri baseUri;
  final FirebaseAuth firebaseAuth;
  final AuthenticatedClient authenticatedClient;

  const UserRemoteDataSource({
    required this.baseUri,
    required this.firebaseAuth,
    required this.authenticatedClient,
  });

  @override
  User? get currentFirebaseUser => firebaseAuth.currentUser;

  /// curl http://localhost:3001/api/v1/recipients/me
  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final uri = baseUri.resolve("api/v1/recipients/me");
    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch recipient: ${response.statusCode}");
    }

    return RecipientMapper.fromJson(response.body);
  }

  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    final uri = baseUri.resolve("api/v1/recipients/me");
    final response = await authenticatedClient.patch(
      uri,
      body: selfUpdate.toJson(),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to update recipient: ${response.statusCode}");
    }

    return RecipientMapper.fromJson(response.body);
  }
}
