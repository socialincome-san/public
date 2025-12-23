import "package:firebase_auth/firebase_auth.dart";
import "package:http/http.dart" as http;

/// A HTTP client that automatically adds the Firebase ID token as
/// `Authorization: Bearer <token>` header and sets `Content-Type: application/json`.
///
/// Wrap a real `http.Client` and pass this wrapper wherever authenticated
/// requests are required.
class AuthenticatedClient extends http.BaseClient {
  final FirebaseAuth _firebaseAuth;
  final http.Client _inner;

  AuthenticatedClient(this._firebaseAuth, this._inner);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    // Ensure JSON content type regardless of what `http` added earlier.
    request.headers.removeWhere((k, v) => k.toLowerCase() == "content-type");
    request.headers["content-type"] = "application/json";

    // Add Firebase ID token as Bearer authentication if available.
    final user = _firebaseAuth.currentUser;
    if (user != null) {
      final idToken = await user.getIdToken();
      request.headers["Authorization"] = "Bearer $idToken";
    }

    return _inner.send(request);
  }

  /// Close both this wrapper and the inner client.
  @override
  void close() {
    _inner.close();
    super.close();
  }
}
