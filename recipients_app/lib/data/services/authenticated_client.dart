import "dart:async";

import "package:app/data/services/auth_service.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:http/http.dart" as http;

/// A HTTP client that automatically adds the Firebase ID token as
/// `Authorization: Bearer <token>` header, appCheckToken as X-Firebase-AppCheck header and sets `Content-Type: application/json`.
///
/// Wrap a real `http.Client` and pass this wrapper wherever authenticated
/// requests are required.
class AuthenticatedClient extends http.BaseClient {
  final FirebaseAuth _firebaseAuth;
  final http.Client _baseHttpClient;
  final Uri _baseUri;

  AuthenticatedClient(this._firebaseAuth, this._baseHttpClient, this._baseUri);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    // Ensure JSON content type regardless of what `http` added earlier.
    request.headers.removeWhere((k, v) => k.toLowerCase() == "content-type");
    request.headers["content-type"] = "application/json";

    // Add app check token to access our Social Income API
    request.headers["X-Firebase-AppCheck"] = await _getAppCheckToken();

    // Add Firebase ID token as Bearer authentication if available.
    final user = _firebaseAuth.currentUser;
    if (user != null) {
      final idToken = await user.getIdToken();
      request.headers["Authorization"] = "Bearer $idToken";
    }

    return _baseHttpClient
        .send(request)
        .timeout(
          const Duration(seconds: 30),
          onTimeout: () => throw TimeoutException("Request to '${request.url}' timed out. Please try again."),
        );
  }

  Uri resolveUri(String path) {
    return _baseUri.resolve(path);
  }

  Future<String> _getAppCheckToken() async {
    final appCheckToken = await FirebaseAppCheck.instance.getToken();
    if (appCheckToken == null) {
      throw AuthException(
        code: "invalid-app-check-token",
        message: "Failed to get App Check token. Can't verify user. Please try again later and update the app.",
      );
    }
    return appCheckToken;
  }

  /// Close both this wrapper and the inner http client.
  @override
  void close() {
    _baseHttpClient.close();
    super.close();
  }
}
