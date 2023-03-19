import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/balance_card/balance_card_bottom_action.dart";
import "package:app/view/widgets/income/balance_card/balance_card_grid.dart";
import "package:app/view/widgets/income/balance_card/balance_card_header.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class BalanceCardContainer extends StatelessWidget {
  const BalanceCardContainer({super.key});

  @override
  Widget build(BuildContext context) {
    final paymentsUiState =
        context.watch<PaymentsCubit>().state.paymentsUiState;

    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: AppSpacings.a16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              mainAxisSize: MainAxisSize.min,
              children: [
                BalanceCardHeader(
                  daysTo: paymentsUiState?.nextPayment.daysToPayment ?? 0,
                  amount: paymentsUiState?.nextPayment.amount ?? 0,
                  balanceCardStatus:
                      paymentsUiState?.status ?? BalanceCardStatus.allConfirmed,
                ),
                const SizedBox(height: 16),
                const Text(
                  "My Payments",
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 8),
                BalanceCardGrid(
                  payments: paymentsUiState?.payments ?? [],
                ),
              ],
            ),
          ),
          if (paymentsUiState != null) ...[
            BalanceCardBottomAction(paymentsUiState: paymentsUiState),
          ],
        ],
      ),
    );
  }
}
