import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/balance_card/balance_card_container.dart";
import "package:app/view/widgets/survey/survey_card_container.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final authCubit = context.read<AuthCubit>();

    return BlocProvider(
      create: (context) => PaymentsCubit(
        recipient: authCubit.state.recipient!,
        paymentRepository: context.read<PaymentRepository>(),
        crashReportingRepository: context.read<CrashReportingRepository>(),
      )..loadPayments(),
      child: const _DashboardView(),
    );
  }
}

class _DashboardView extends StatelessWidget {
  const _DashboardView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PaymentsCubit, PaymentsState>(
      builder: (context, state) {
        final dashboardItems = [const SurveyCard()];

        return Padding(
          padding: AppSpacings.h8,
          child: Column(
            children: [
              const BalanceCardContainer(),
              const SizedBox(height: 8),
              if (dashboardItems.isEmpty)
                const Padding(
                  padding: AppSpacings.a8,
                  child: Expanded(
                    child: Center(
                      child: Text(
                        "You are up to date.\nNo news today.",
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
                    itemCount: dashboardItems.length,
                    itemBuilder: (context, index) => dashboardItems[index],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
