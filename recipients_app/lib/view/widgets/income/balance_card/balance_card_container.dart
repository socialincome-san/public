import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payment_tile.dart";
import "package:app/view/pages/payments_page.dart";
import "package:app/view/widgets/income/balance_card/balance_card_grid.dart";
import "package:app/view/widgets/income/balance_card/balance_card_header.dart";
import "package:app/view/widgets/income/balance_card/on_hold_bottom_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

const _kShowPaymentCardStatuses = [
  PaymentUiStatus.contested,
  PaymentUiStatus.recentToReview,
  PaymentUiStatus.toReview,
];

class BalanceCardContainer extends StatelessWidget {
  const BalanceCardContainer({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    final paymentsUiState =
        context.watch<PaymentsCubit>().state.paymentsUiState;

    final MappedPayment? lastPaidPayment = paymentsUiState?.lastPaidPayment;

    return Column(
      children: [
        GestureDetector(
          onTap: () => _navigateToPaymentsList(context),
          child: Card(
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
                        balanceCardStatus: paymentsUiState?.status ??
                            BalanceCardStatus.allConfirmed,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        localizations.myPayments,
                        style: const TextStyle(
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
              ],
            ),
          ),
        ),
        if (paymentsUiState != null &&
            paymentsUiState.status == BalanceCardStatus.onHold) ...[
          OnHoldBottomCard(
            reviewAction: () => _navigateToPaymentsList(context),
          ),
        ],
        if (lastPaidPayment != null &&
            _kShowPaymentCardStatuses.contains(lastPaidPayment.uiStatus)) ...[
          PaymentTile(mappedPayment: lastPaidPayment),
        ],
      ],
    );
  }

  void _navigateToPaymentsList(BuildContext context) {
    final paymentsCubit = context.read<PaymentsCubit>();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BlocProvider.value(
          value: paymentsCubit,
          child: const PaymentsPage(),
        ),
      ),
    );
  }
}
