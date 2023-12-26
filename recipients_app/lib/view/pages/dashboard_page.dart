import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/dashboard_card_manager/dashboard_card_manager_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:app/view/widgets/income/balance_card/balance_card_container.dart";
import "package:app/view/widgets/survey/survey_card_container.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authCubit = context.read<AuthCubit>();

    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => PaymentsCubit(
            recipient: authCubit.state.recipient!,
            paymentRepository: context.read<PaymentRepository>(),
            crashReportingRepository: context.read<CrashReportingRepository>(),
          )..loadPayments(),
        ),
        BlocProvider(
          create: (context) => DashboardCardManagerCubit(
            crashReportingRepository: context.read<CrashReportingRepository>(),
            authCubit: context.read<AuthCubit>(),
          )..fetchCards(),
        ),
        BlocProvider(
          create: (context) => SurveyCubit(
            recipient: authCubit.state.recipient!,
            surveyRepository: context.read<SurveyRepository>(),
            crashReportingRepository: context.read<CrashReportingRepository>(),
          )..getSurveys(),
        ),
      ],
      child: const _DashboardView(),
    );
  }
}

class _DashboardView extends StatelessWidget {
  const _DashboardView();

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    final List<DashboardItem> dashboardItems = context
        .watch<DashboardCardManagerCubit>()
        .state
        .cards
        .map<DashboardItem>((card) => card)
        .toList();

    final List<DashboardItem> surveysItems = context
        .watch<SurveyCubit>()
        .state
        .dashboardMappedSurveys
        .map<DashboardItem>(
          (survey) => SurveyCardContainer(
            mappedSurvey: survey,
          ),
        )
        .toList();

    final items = dashboardItems + surveysItems;

    return BlocBuilder<PaymentsCubit, PaymentsState>(
      builder: (context, state) {
        return Padding(
          padding: AppSpacings.h8,
          child: Column(
            children: [
              const BalanceCardContainer(),
              const SizedBox(height: 8),
              if (items.isEmpty)
                Expanded(
                  child: Padding(
                    padding: AppSpacings.a8,
                    child: Center(
                      child: Text(
                        localizations.dashboardUp2Date,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 8),
                    itemCount: items.length,
                    itemBuilder: (context, index) => items[index],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
