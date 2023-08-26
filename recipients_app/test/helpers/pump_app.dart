import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/ui/configs/app_theme.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_test/flutter_test.dart";

class MockPaymentsCubit extends MockCubit<PaymentsState>
    implements PaymentsCubit {}

extension PumpApp on WidgetTester {
  Future<void> pumpApp(
    Widget widget, {
    PaymentsCubit? paymentsCubit,
  }) async {
    final mockPaymentsCubit = paymentsCubit ?? MockPaymentsCubit();

    return pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider.value(value: mockPaymentsCubit),
        ],
        child: MaterialApp(
          supportedLocales: const [
            Locale("en", ""),
            Locale("de", ""),
          ],
          theme: AppTheme.lightTheme,
          home: widget,
        ),
      ),
    );
  }
}
