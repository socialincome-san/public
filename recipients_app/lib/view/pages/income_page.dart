import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/social_income_payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/balance_card.dart";
import "package:app/view/widgets/income/payment_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class IncomePage extends StatelessWidget {
  const IncomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        final payments = state.recipient?.payments ?? <SocialIncomePayment>[];

        return Padding(
          padding: AppSpacings.a16,
          child: Column(
            children: [
              const BalanceCard(),
              const SizedBox(height: 8),
              if (payments.isEmpty)
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
                        PaymentCard(payment: payments[index]),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
