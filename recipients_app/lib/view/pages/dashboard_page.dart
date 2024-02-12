import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/dashboard_card_manager/dashboard_card_manager_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:app/view/widgets/empty_item.dart";
import "package:app/view/widgets/income/balance_card/balance_card_container.dart";
import "package:app/view/widgets/survey/survey_card_container.dart";
import "package:app/view/widgets/survey/surveys_overview_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

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
    final surveys = context.watch<SurveyCubit>().state.mappedSurveys;

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

    final dynamicItemsCount = dashboardItems.length + surveysItems.length;

    final List<DashboardItem> headerItems = [
      const BalanceCardContainer(),
      SurveysOverviewCard(mappedSurveys: surveys),
    ];

    List<DashboardItem> items;

    if (dynamicItemsCount > 0) {
      items = headerItems + dashboardItems + surveysItems;
    } else {
      items = headerItems + [const EmptyItem()];
    }

    return BlocBuilder<PaymentsCubit, PaymentsState>(
      builder: (context, state) {
        return Padding(
          padding: AppSpacings.h8,
          child: ListView.separated(
            separatorBuilder: (context, index) => const SizedBox(height: 4),
            itemCount: items.length,
            itemBuilder: (context, index) => items[index],
            physics: const BouncingScrollPhysics(),
          ),
        );
      },
    );
  }
}
