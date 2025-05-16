import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/app_theme.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:flutter_test/flutter_test.dart";

class MockPaymentsCubit extends MockCubit<PaymentsState> implements PaymentsCubit {}

extension PumpApp on WidgetTester {
  Future<void> pumpApp(Widget widget, {PaymentsCubit? paymentsCubit}) {
    final mockPaymentsCubit = paymentsCubit ?? MockPaymentsCubit();

    return pumpWidget(
      MultiBlocProvider(
        providers: [BlocProvider.value(value: mockPaymentsCubit)],
        child: MaterialApp(
          supportedLocales: const [Locale("en", ""), Locale("de", "")],
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          theme: AppTheme.lightTheme,
          home: widget,
        ),
      ),
    );
  }
}
