import "dart:async";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/recipient.dart";
import "package:app/demo_manager.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/view/pages/terms_and_conditions_page.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

import "../../helpers/pump_app.dart";

class MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

// Only `successorName` is read; building a real Recipient needs its whole object graph.
// ignore: avoid_implementing_value_types
class MockRecipient extends Mock implements Recipient {}

AuthState _stateWithSuccessor(String? successorName) {
  final recipient = MockRecipient();
  when(() => recipient.successorName).thenReturn(successorName);
  return AuthState(status: AuthStatus.authenticated, recipient: recipient);
}

void main() {
  late MockAuthCubit authCubit;
  late StreamController<AuthState> states;

  setUpAll(() {
    registerFallbackValue(const RecipientSelfUpdate());
  });

  setUp(() {
    authCubit = MockAuthCubit();
    states = StreamController<AuthState>();
    when(
      () => authCubit.updateRecipient(selfUpdate: any(named: "selfUpdate")),
    ).thenAnswer((_) async => true);
  });

  tearDown(() => states.close());

  Future<void> pumpPage(WidgetTester tester, AuthState initialState) async {
    whenListen(authCubit, states.stream, initialState: initialState);
    await tester.pumpApp(
      RepositoryProvider.value(
        value: DemoManager(),
        child: BlocProvider<AuthCubit>.value(
          value: authCubit,
          child: const TermsAndConditionsPage(),
        ),
      ),
    );
  }

  String fieldText(WidgetTester tester) => tester.widget<TextField>(find.byType(TextField)).controller!.text;

  Future<RecipientSelfUpdate> tapAccept(WidgetTester tester) async {
    await tester.ensureVisible(find.byType(ButtonBig));
    await tester.tap(find.byType(ButtonBig));
    await tester.pump();
    return verify(
          () => authCubit.updateRecipient(selfUpdate: captureAny(named: "selfUpdate")),
        ).captured.single
        as RecipientSelfUpdate;
  }

  testWidgets("sends the name the user entered", (tester) async {
    await pumpPage(tester, _stateWithSuccessor(null));

    await tester.enterText(find.byType(TextField), "  Bob  ");

    final update = await tapAccept(tester);
    expect(update.termsAccepted, isTrue);
    expect(update.successorName, "Bob");
  });

  testWidgets("sends the prefilled name when the user keeps it", (tester) async {
    await pumpPage(tester, _stateWithSuccessor("Jane"));
    expect(fieldText(tester), "Jane");

    final update = await tapAccept(tester);
    expect(update.successorName, "Jane");
  });

  testWidgets("sends an empty string when the user clears an existing successor", (tester) async {
    await pumpPage(tester, _stateWithSuccessor("Jane"));

    await tester.enterText(find.byType(TextField), "");

    final update = await tapAccept(tester);
    expect(update.successorName, "");
  });

  testWidgets("sends an empty string when the user leaves the field empty", (tester) async {
    await pumpPage(tester, _stateWithSuccessor(null));

    final update = await tapAccept(tester);
    expect(update.termsAccepted, isTrue);
    expect(update.successorName, "");
  });
}
