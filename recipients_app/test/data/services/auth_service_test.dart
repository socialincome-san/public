import "dart:io";

import "package:app/data/services/auth_service.dart";
import "package:app/data/services/authenticated_client.dart";
import "package:app/demo_manager.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_test/flutter_test.dart";
import "package:http/http.dart" as http;
import "package:http/testing.dart";
import "package:mocktail/mocktail.dart";

class MockFirebaseAuth extends Mock implements FirebaseAuth {}

class MockFirebaseAppCheck extends Mock implements FirebaseAppCheck {}

void main() {
  AuthService authServiceAnswering(Future<http.Response> Function() answer) {
    final firebaseAuth = MockFirebaseAuth();
    when(() => firebaseAuth.currentUser).thenReturn(null);
    final appCheck = MockFirebaseAppCheck();
    when(() => appCheck.getToken()).thenAnswer((_) async => "token");

    return AuthService(
      firebaseAuth: firebaseAuth,
      demoManager: DemoManager(),
      authenticatedClient: AuthenticatedClient(
        firebaseAuth,
        MockClient((_) => answer()),
        Uri.parse("https://example.org/api/"),
        appCheck: appCheck,
      ),
    );
  }

  Matcher throwsAuthException(String code) => throwsA(isA<AuthException>().having((e) => e.code, "code", code));

  group("verifyPhoneNumber", () {
    test("completes when the API answers 204", () async {
      final authService = authServiceAnswering(() async => http.Response("", 204));

      await expectLater(authService.verifyPhoneNumber("+23212345678"), completes);
    });

    for (final (status, code) in [
      (400, "invalid-phone-number"),
      (401, "invalid-app-check-token"),
      (429, "too-many-verification-requests"),
      (500, "verification-code-not-sent"),
      (502, "verification-code-not-sent"),
    ]) {
      test("maps status $status to $code", () async {
        final authService = authServiceAnswering(() async => http.Response("", status));

        await expectLater(authService.verifyPhoneNumber("+23212345678"), throwsAuthException(code));
      });
    }

    test("keeps the connection hint when the request does not get through", () async {
      final authService = authServiceAnswering(() async => throw const SocketException("no route"));

      await expectLater(
        authService.verifyPhoneNumber("+23212345678"),
        throwsAuthException("failed-sent-verification-code"),
      );
    });
  });
}
