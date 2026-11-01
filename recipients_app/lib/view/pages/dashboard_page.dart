import "dart:async";
import "dart:io";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/offline_exception.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard/dashboard_item.dart";
import "package:app/view/widgets/dashboard/empty_item.dart";
import "package:app/view/widgets/dashboard/welcome_message_card.dart";
import "package:app/view/widgets/income/balance_card/balance_card_container.dart";
import "package:app/view/widgets/survey/survey_card_container.dart";
import "package:app/view/widgets/survey/surveys_overview_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:shared_preferences/shared_preferences.dart";

const _welcomeMessageKeyPrefix = "dashboard_welcome_message_seen_";

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authCubit = context.read<AuthCubit>();

    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => PayoutsCubit(
            recipient: authCubit.state.recipient!,
            paymentRepository: context.read<PaymentRepository>(),
            crashReportingRepository: context.read<CrashReportingRepository>(),
          )..loadPayments(),
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

class _DashboardView extends StatefulWidget {
  const _DashboardView();

  @override
  State<_DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<_DashboardView> {
  final _refreshIndicatorKey = GlobalKey<RefreshIndicatorState>();
  final _preferences = SharedPreferencesAsync();
  String? _recipientId;
  bool _showWelcomeMessage = false;

  @override
  void initState() {
    super.initState();
    _recipientId = context.read<AuthCubit>().state.recipient?.id;
    final recipientId = _recipientId;
    if (recipientId != null) {
      unawaited(_loadWelcomeMessage(recipientId));
    }
  }

  Future<void> _loadWelcomeMessage(String recipientId) async {
    final crashReportingRepository = context.read<CrashReportingRepository>();
    try {
      final hasSeenWelcomeMessage =
          await _preferences.getBool("$_welcomeMessageKeyPrefix$recipientId") ?? false;
      if (!mounted || _recipientId != recipientId) return;
      setState(() => _showWelcomeMessage = !hasSeenWelcomeMessage);
    } on Exception catch (exception, stackTrace) {
      await crashReportingRepository.logError(exception, stackTrace);
      if (!mounted || _recipientId != recipientId) return;
      setState(() => _showWelcomeMessage = true);
    }
  }

  Future<void> _dismissWelcomeMessage() async {
    final recipientId = _recipientId;
    if (recipientId == null) return;
    final crashReportingRepository = context.read<CrashReportingRepository>();

    try {
      await _preferences.setBool("$_welcomeMessageKeyPrefix$recipientId", true);
      if (!mounted || _recipientId != recipientId) return;
      setState(() => _showWelcomeMessage = false);
    } on Exception catch (exception, stackTrace) {
      await crashReportingRepository.logError(exception, stackTrace);
      if (!mounted) return;
      FlushbarHelper.showFlushbar(
        context,
        message: context.l10n.anErrorOccurred,
        type: FlushbarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final surveys = context.watch<SurveyCubit>().state.mappedSurveys;

    final List<DashboardItem> surveysItems = context
        .watch<SurveyCubit>()
        .state
        .dashboardMappedSurveys
        .map<DashboardItem>(
          (survey) => SurveyCardContainer(mappedSurvey: survey),
        )
        .toList();

    final List<DashboardItem> headerItems = [
      if (_showWelcomeMessage) WelcomeMessageCard(onDismiss: _dismissWelcomeMessage),
      const BalanceCardContainer(),
      SurveysOverviewCard(mappedSurveys: surveys),
    ];

    List<DashboardItem> items;

    if (surveysItems.isNotEmpty) {
      items = headerItems + surveysItems;
    } else {
      items = headerItems + [const EmptyItem()];
    }

    return BlocBuilder<PayoutsCubit, PayoutsState>(
      builder: (context, state) {
        return RefreshIndicator(
          key: _refreshIndicatorKey,
          onRefresh: () async {
            context.read<PayoutsCubit>().loadPayments();
            context.read<SurveyCubit>().getSurveys();
          },
          child: MultiBlocListener(
            listeners: [
              BlocListener<AuthCubit, AuthState>(
                listener: (context, state) {
                  final recipientId = state.recipient?.id;
                  if (recipientId == _recipientId) return;

                  setState(() {
                    _recipientId = recipientId;
                    _showWelcomeMessage = false;
                  });
                  if (recipientId != null) {
                    unawaited(_loadWelcomeMessage(recipientId));
                  }
                },
              ),
              BlocListener<PayoutsCubit, PayoutsState>(
                listener: (context, state) {
                  if (state.status == PayoutsStatus.failure) {
                    if (state.exception is SocketException) {
                      FlushbarHelper.showFlushbar(
                        context,
                        message: context.l10n.noInternetConnection,
                        type: FlushbarType.error,
                      );
                    } else if (state.exception is OfflineMutationException) {
                      FlushbarHelper.showFlushbar(
                        context,
                        message: context.l10n.offlineMutationError,
                        type: FlushbarType.error,
                      );
                    } else {
                      FlushbarHelper.showFlushbar(
                        context,
                        message: state.exception?.toString() ?? context.l10n.anErrorOccurred,
                        type: FlushbarType.error,
                      );
                    }
                  }
                },
              ),
              BlocListener<SurveyCubit, SurveyState>(
                listener: (context, state) {
                  if (state.status == SurveyStateStatus.updatedFailure) {
                    state.exception is SocketException
                        ? FlushbarHelper.showFlushbar(
                            context,
                            message: context.l10n.noInternetConnection,
                            type: FlushbarType.error,
                          )
                        : FlushbarHelper.showFlushbar(
                            context,
                            message: state.exception?.toString() ?? context.l10n.anErrorOccurred,
                            type: FlushbarType.error,
                          );
                  }
                },
              ),
            ],
            child: Padding(
              padding: AppSpacings.h8,
              child: Column(
                children: [
                  Expanded(
                    child: ListView.separated(
                      separatorBuilder: (context, index) => const SizedBox(height: 4),
                      itemCount: items.length,
                      itemBuilder: (context, index) => items[index],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
