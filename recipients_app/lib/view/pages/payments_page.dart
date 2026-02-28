import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payment_tile.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class PaymentsPage extends StatefulWidget {
  const PaymentsPage({super.key});

  @override
  State<PaymentsPage> createState() => _PaymentsPageState();
}

class _PaymentsPageState extends State<PaymentsPage> {
  final _refreshIndicatorKey = GlobalKey<RefreshIndicatorState>();

  @override
  Widget build(BuildContext context) {
    final recipient = context.watch<AuthCubit>().state.recipient;
    final payoutsUiState = context.watch<PayoutsCubit>().state.payoutsUiState!;

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(context.l10n.payments),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: () => context.read<PayoutsCubit>().loadPayments(),
        child: ListView(
          padding: AppSpacings.h8,
          children: [
            Card(
              clipBehavior: Clip.antiAlias,
              color: Colors.white,
              child: Container(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.l10n.orangeMoneyNumber,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        recipient?.contact.phone?.number ?? "",
                        style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                context.l10n.pastPayments,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _calculatePastPayments(
                                  payoutsUiState.payouts,
                                ),
                                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                                  color: AppColors.primaryColor,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                context.l10n.futurePayments,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                payoutsUiState.status != BalanceCardStatus.onHold
                                    ? _calculateFuturePayments(
                                        payoutsUiState.payouts,
                                      )
                                    : context.l10n.paymentsSuspended,
                                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                                  color: payoutsUiState.status != BalanceCardStatus.onHold
                                      ? AppColors.primaryColor
                                      : AppColors.redColor,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (payoutsUiState.payouts.isEmpty)
              Padding(
                padding: AppSpacings.a8,
                child: Center(
                  child: Text(
                    context.l10n.paymentsEmptyList,
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                itemCount: payoutsUiState.payouts.length,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return PaymentTile(
                    mappedPayment: payoutsUiState.payouts[index],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  String _calculatePastPayments(List<MappedPayout> mappedPayments) {
    var total = 0;

    final List<MappedPayout> paidOrConfirmedPayments = _getAllPaidOrConfirmedPayments(mappedPayments);

    for (final payment in paidOrConfirmedPayments) {
      // Some of the users still have the currency SLL from the begining of the program. We will change it to SLE.
      final factor = (payment.payout.currency.name.toUpperCase() == "SLL") ? 1000 : 1;
      total += (payment.payout.amount) ~/ factor;
    }

    return "${paidOrConfirmedPayments.firstOrNull?.payout.currency.toDisplayString() ?? "???"} $total";
  }

  String _calculateFuturePayments(List<MappedPayout> mappedPayments) {
    final List<MappedPayout> paidOrConfirmedPayments = _getAllPaidOrConfirmedPayments(mappedPayments);

    // Due to problem that payment amount can change, we need to calculate the future payments without calculation of previous payments
    final futurePayments = (kProgramDurationMonths - paidOrConfirmedPayments.length) * kCurrentPaymentAmount;

    return "${paidOrConfirmedPayments.firstOrNull?.payout.currency.toDisplayString() ?? "???"} $futurePayments";
  }

  List<MappedPayout> _getAllPaidOrConfirmedPayments(List<MappedPayout> mappedPayments) {
    final paidOrConfirmedPayments = mappedPayments.where(
      (payment) {
        final paymentStatus = payment.payout.status;
        return paymentStatus == PayoutStatus.paid || paymentStatus == PayoutStatus.confirmed;
      },
    ).toList();
    return paidOrConfirmedPayments;
  }
}
