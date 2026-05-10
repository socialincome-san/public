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
    // Refuse cross-origin requests so Bearer + AppCheck tokens can't leak to
    // an unintended host if a caller passes an absolute URL.
    if (request.url.scheme != _baseUri.scheme ||
        request.url.host != _baseUri.host ||
        request.url.port != _baseUri.port) {
      throw ArgumentError.value(
        request.url,
        "request.url",
        "AuthenticatedClient authority does not match base "
            "'${_baseUri.scheme}://${_baseUri.host}:${_baseUri.port}'. Use resolveUri() with a relative path.",
      );
    }

    // Ensure JSON content type regardless of what `http` added earlier.
    request.headers.removeWhere((k, v) => k.toLowerCase() == "content-type");
    request.headers["content-type"] = "application/json";

    // Add app check token to access our Social Income API.
    request.headers["X-Firebase-AppCheck"] = await _getAppCheckToken();

    // Add Firebase ID token as Bearer authentication if available.
    final user = _firebaseAuth.currentUser;
    if (user != null) {
      final idToken = await user.getIdToken();
      request.headers["Authorization"] = "Bearer $idToken";
    }

    // Send the request.
    var response = await _baseHttpClient
        .send(request)
        .timeout(
          const Duration(seconds: 30),
          onTimeout: () => throw TimeoutException("Request to '${request.url}' timed out. Please try again."),
        );

    // If statusCode 401 (Unauthorized) is returned, force-refresh id token and retry once.
    if (response.statusCode == 401) {
      final newToken = await user?.getIdToken(true);
      if (newToken != null) {
        request.headers["Authorization"] = "Bearer $newToken";
        response = await _baseHttpClient
            .send(request)
            .timeout(
              const Duration(seconds: 30),
              onTimeout: () => throw TimeoutException("Request to '${request.url}' timed out. Please try again."),
            );
      }
    }

    return response;
  }

  Uri resolveUri(String path) {
    return _baseUri.resolve(path);
  }

  Future<String> _getAppCheckToken() async {
    try {
      final appCheckToken = await FirebaseAppCheck.instance.getToken();
      if (appCheckToken == null) {
        throw AuthException(
          code: "invalid-app-check-token",
          message: "Failed to get App Check token. Can't verify user. Please try again later and update the app.",
        );
      }
      return appCheckToken;
    } on FirebaseException catch (e) {
      // Play Integrity exposes its error code only in the message string
      // (e.g. "IntegrityServiceException: -1: Integrity API is not available"),
      // so we substring-match. -1 = API_NOT_AVAILABLE, fixable by updating Play Store.
      final message = (e.message ?? "").toLowerCase();
      if (message.contains("integrity api is not available") || message.contains("integrityserviceexception: -1")) {
        throw AuthException(code: "play-integrity-unavailable", message: e.toString());
      }
      rethrow;
    }
  }

  /// Close both this wrapper and the inner http client.
  @override
  void close() {
    _baseHttpClient.close();
    super.close();
  }
}
