import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/balance_card.dart";
import "package:app/view/widgets/income/payment_card.dart";
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
      )..loadPayments(),
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
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PaymentsCubit, PaymentsState>(
      builder: (context, state) {
        final payments = state.paymentsUiState?.payments ?? [];

        return Padding(
          padding: AppSpacings.a16,
          child: Column(
            children: [
              const BalanceCard(),
              const SizedBox(height: 8),
              if (payments.isEmpty == true)
                const Expanded(
                  child: Center(
                    child: Text(
                      "All future Social Income payments will be shown on this screen.",
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 8),
                    itemCount: payments.length,
                    itemBuilder: (context, index) =>
                        PaymentCard(payment: payments[index].payment),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
