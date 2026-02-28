import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/ui/configs/app_theme.dart";
import "package:bloc_test/bloc_test.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:flutter_test/flutter_test.dart";

class MockPayoutsCubit extends MockCubit<PayoutsState> implements PayoutsCubit {}

extension PumpApp on WidgetTester {
  Future<void> pumpApp(
    Widget widget, {
    PayoutsCubit? paymentsCubit,
  }) {
    final mockPayoutsCubit = paymentsCubit ?? MockPayoutsCubit();

    return pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider.value(value: mockPayoutsCubit),
        ],
        child: MaterialApp(
          supportedLocales: const [
            Locale("en", ""),
            Locale("de", ""),
          ],
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
