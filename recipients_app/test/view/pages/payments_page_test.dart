import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/view/pages/payments_page.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_test/flutter_test.dart";
import "package:mocktail/mocktail.dart";

import "../../helpers/pump_app.dart";

class MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  late MockAuthCubit authCubit;
  late MockPayoutsCubit payoutsCubit;

  setUp(() {
    authCubit = MockAuthCubit();
    payoutsCubit = MockPayoutsCubit();
    when(() => authCubit.state).thenReturn(const AuthState());
  });

  Future<void> pumpPage(WidgetTester tester, PayoutsState state) {
    when(() => payoutsCubit.state).thenReturn(state);
    return tester.pumpApp(
      BlocProvider<AuthCubit>.value(value: authCubit, child: const PaymentsPage()),
      paymentsCubit: payoutsCubit,
    );
  }

  testWidgets("shows an error instead of crashing when loading the payouts failed", (tester) async {
    await pumpPage(tester, const PayoutsState(status: PayoutsStatus.failure));

    expect(tester.takeException(), isNull);
    expect(find.text("An error occurred"), findsOneWidget);
  });

  testWidgets("shows a progress indicator while the payouts are loading", (tester) async {
    await pumpPage(tester, const PayoutsState(status: PayoutsStatus.loading));

    expect(tester.takeException(), isNull);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
