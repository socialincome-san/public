import "dart:io";

import "package:app/data/services/auth_service.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_test/flutter_test.dart";
import "package:http/http.dart" as http;
import "package:http/testing.dart";
import "package:mocktail/mocktail.dart";

class MockFirebaseAuth extends Mock implements FirebaseAuth {}

class MockFirebaseAppCheck extends Mock implements FirebaseAppCheck {}

void main() {
  final baseUri = Uri.parse("https://example.org/api/");
  late MockFirebaseAppCheck appCheck;
  late List<http.Request> requests;
  late AuthenticatedClient client;

  FirebaseException appCheckError(String message) =>
      FirebaseException(plugin: "firebase_app_check", code: "unknown", message: message);

  setUp(() {
    final firebaseAuth = MockFirebaseAuth();
    when(() => firebaseAuth.currentUser).thenReturn(null);
    appCheck = MockFirebaseAppCheck();
    requests = [];
    client = AuthenticatedClient(
      firebaseAuth,
      MockClient((request) async {
        requests.add(request);
        return http.Response("{}", 200);
      }),
      baseUri,
      appCheck: appCheck,
    );
  });

  test("sends the App Check token with the request", () async {
    when(() => appCheck.getToken()).thenAnswer((_) async => "token");

    await client.get(client.resolveUri("recipients/me"));

    expect(requests.single.headers["X-Firebase-AppCheck"], "token");
  });

  test("retries once when fetching the App Check token fails", () async {
    var attempts = 0;
    when(() => appCheck.getToken()).thenAnswer((_) async {
      attempts++;
      if (attempts == 1) throw appCheckError("unexpected end of stream");
      return "token";
    });

    await client.get(client.resolveUri("recipients/me"));

    expect(attempts, 2);
    expect(requests.single.headers["X-Firebase-AppCheck"], "token");
  });

  test("throws a network error when the App Check token still fails after the retry", () async {
    when(() => appCheck.getToken()).thenThrow(appCheckError("unexpected end of stream"));

    await expectLater(
      client.get(client.resolveUri("recipients/me")),
      throwsA(isA<HttpException>()),
    );

    verify(() => appCheck.getToken()).called(2);
    expect(requests, isEmpty);
  });

  test("keeps reporting an unavailable Play Integrity API as an auth error", () async {
    when(() => appCheck.getToken()).thenThrow(
      appCheckError("IntegrityServiceException: -1: Integrity API is not available"),
    );

    await expectLater(
      client.get(client.resolveUri("recipients/me")),
      throwsA(isA<AuthException>().having((e) => e.code, "code", "play-integrity-unavailable")),
    );
  });
}
