import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/models.dart";
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
    final paymentsUiState = context.watch<PaymentsCubit>().state.paymentsUiState!;

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(context.l10n.payments),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: () async => context.read<PaymentsCubit>().loadPayments(),
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
                        "${recipient?.mobileMoneyPhone?.phoneNumber ?? ""}",
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
                                  paymentsUiState.payments,
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
                                paymentsUiState.status != BalanceCardStatus.onHold
                                    ? _calculateFuturePayments(
                                        paymentsUiState.payments,
                                      )
                                    : context.l10n.paymentsSuspended,
                                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                                      color: paymentsUiState.status != BalanceCardStatus.onHold
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
            if (paymentsUiState.payments.isEmpty)
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
                itemCount: paymentsUiState.payments.length,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return PaymentTile(
                    mappedPayment: paymentsUiState.payments[index],
                  );
                },
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
    final futurePayments = (kProgramDurationMonths - mappedPayments.length) * kCurrentPaymentAmount;

    return "${mappedPayments.firstOrNull?.payment.currency ?? "SLE"} $futurePayments";
  }
}
