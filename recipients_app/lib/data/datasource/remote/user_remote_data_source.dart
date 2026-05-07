import "dart:convert";

import "package:app/data/datasource/user_data_source.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:firebase_auth/firebase_auth.dart";

class UserRemoteDataSource implements UserDataSource {
  final FirebaseAuth firebaseAuth;
  final AuthenticatedClient authenticatedClient;

  UserRemoteDataSource({
    required this.firebaseAuth,
    required this.authenticatedClient,
  });

  @override
  User? get currentFirebaseUser => firebaseAuth.currentUser;

  @override
  Future<Recipient?> fetchRecipient(User firebaseUser) async {
    final uri = authenticatedClient.resolveUri("recipients/me");
    final response = await authenticatedClient.get(uri);

    if (response.statusCode == 404) { // no user found
      return null;
    }

    if (response.statusCode != 200) { // any other error
      throw Exception("Failed to fetch recipient: ${response.statusCode} - ${response.body}");
    }

    return RecipientMapper.fromJson(response.body);
  }

  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    final uri = authenticatedClient.resolveUri("recipients/me");
    final response = await authenticatedClient.patch(
      uri,
      body: jsonEncode(selfUpdate.toMap()),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to update recipient: ${response.statusCode} - ${response.body}");
    }

    return RecipientMapper.fromJson(response.body);
  }
}
