import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/payment_tile.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class PaymentsPage extends StatelessWidget {
  const PaymentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    final recipient = context.watch<AuthCubit>().state.recipient;
    final paymentsUiState =
        context.watch<PaymentsCubit>().state.paymentsUiState!;

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(localizations.payments),
        centerTitle: true,
      ),
      body: Padding(
        padding: AppSpacings.h8,
        child: Column(
          children: [
            Card(
              clipBehavior: Clip.antiAlias,
              color: Colors.white,
              child: Container(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localizations.orangeMoneyNumber,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "${recipient?.mobileMoneyPhone?.phoneNumber ?? ""}",
                        style:
                            Theme.of(context).textTheme.headlineLarge?.copyWith(
                                  color: AppColors.primaryColor,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  localizations.pastPayments,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _calculatePastPayments(
                                      paymentsUiState.payments),
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineLarge
                                      ?.copyWith(
                                        color: AppColors.primaryColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  localizations.futurePayments,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  paymentsUiState.status !=
                                          BalanceCardStatus.onHold
                                      ? _calculateFuturePayments(
                                          paymentsUiState.payments)
                                      : localizations.paymentsSuspended,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineLarge
                                      ?.copyWith(
                                        color: paymentsUiState.status !=
                                                BalanceCardStatus.onHold
                                            ? AppColors.primaryColor
                                            : AppColors.redColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: paymentsUiState.payments.length,
                itemBuilder: (context, index) {
                  return PaymentTile(
                    mappedPayment: paymentsUiState.payments[index],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _calculatePastPayments(List<MappedPayment> mappedPayments) {
    var total = 0;

    for (final mappedPayment in mappedPayments) {
      // some of the users still have SLL from begining of the program,
      // we will change it to SLE
      final factor = (mappedPayment.payment.currency == "SLL") ? 1000 : 1;
      total += (mappedPayment.payment.amount ?? 0) ~/ factor;
    }

    return "${mappedPayments.firstOrNull?.payment.currency ?? "SLE"} $total";
  }

  String _calculateFuturePayments(List<MappedPayment> mappedPayments) {
    // due to problem that payment amount can change we need to calculate
    // the future payments without calculation of previous payments
    final futurePayments = (kProgramDurationMonths - mappedPayments.length) *
        kCurrentPaymentAmount;

    return "${mappedPayments.firstOrNull?.payment.currency ?? "SLE"} ${futurePayments}";
  }
}
