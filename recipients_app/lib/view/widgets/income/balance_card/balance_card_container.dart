import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payment_tile.dart";
import "package:app/view/pages/payments_page.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:app/view/widgets/income/balance_card/balance_card_grid.dart";
import "package:app/view/widgets/income/balance_card/balance_card_header.dart";
import "package:app/view/widgets/income/balance_card/on_hold_bottom_card.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

const _kShowPaymentCardStatuses = [
  PayoutUiStatus.contested,
  PayoutUiStatus.recentToReview,
  PayoutUiStatus.toReview,
];

class BalanceCardContainer extends DashboardItem {
  const BalanceCardContainer({super.key});

  @override
  Widget build(BuildContext context) {
    final payoutsUiState = context.watch<PayoutsCubit>().state.payoutsUiState;

    final MappedPayout? lastPaidPayment = payoutsUiState?.lastPaidPayout;

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
                        daysTo: payoutsUiState?.nextPayout.daysToPayout ?? 0,
                        amount: payoutsUiState?.nextPayout.amount ?? 0,
                        balanceCardStatus: payoutsUiState?.status ?? BalanceCardStatus.allConfirmed,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        context.l10n.myPayments,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 13.0,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 8),
                      BalanceCardGrid(
                        payments: payoutsUiState?.payouts ?? [],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        if (payoutsUiState != null && payoutsUiState.status == BalanceCardStatus.onHold) ...[
          OnHoldBottomCard(
            reviewAction: () => _navigateToPaymentsList(context),
          ),
        ],
        if (lastPaidPayment != null && _kShowPaymentCardStatuses.contains(lastPaidPayment.uiStatus)) ...[
          PaymentTile(mappedPayment: lastPaidPayment),
        ],
        const SizedBox(height: 4),
      ],
    );
  }

  void _navigateToPaymentsList(BuildContext context) {
    final paymentsCubit = context.read<PayoutsCubit>();
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
