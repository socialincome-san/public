import "dart:convert";

import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRemoteDataSource implements UserDataSource {
  final Uri baseUri;
  final FirebaseAuth firebaseAuth;
  final AuthenticatedClient authenticatedClient;

  Recipient? _currentRecipient;

  UserRemoteDataSource({
    required this.baseUri,
    required this.firebaseAuth,
    required this.authenticatedClient,
  });

  @override
  User? get currentFirebaseUser => firebaseAuth.currentUser;

  @override
  Recipient? get currentRecipient => _currentRecipient;

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final uri = baseUri.resolve("api/v1/recipients/me");
    final response = await authenticatedClient.get(uri);

    if (response.statusCode != 200) {
      _currentRecipient = null;
      throw Exception("Failed to fetch recipient: ${response.statusCode}");
    }

    final recipient = RecipientMapper.fromJson(response.body);
    _currentRecipient = recipient;
    return recipient;
  }

  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    final uri = baseUri.resolve("api/v1/recipients/me");
    final response = await authenticatedClient.patch(
      uri,
      body: jsonEncode(selfUpdate.toMap()),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to update recipient: ${response.statusCode}");
    }

    final recipient = RecipientMapper.fromJson(response.body);
    _currentRecipient = recipient;
    return recipient;
  }
}
