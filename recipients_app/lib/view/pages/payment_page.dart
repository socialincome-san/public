import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/ui/icons/status.dart";
import "package:app/ui/icons/status_icon_with_text.dart";
import "package:app/view/pages/payment_tile.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";

class PaymentPage extends StatelessWidget {
  final List<SocialIncomePayment> payments;

  const PaymentPage({
    super.key,
    required this.payments,
  });

  @override
  Widget build(BuildContext context) {
    final lastPayment = payments.isNotEmpty ? payments.first : null;
    final recipient = context.watch<AuthCubit>().state.recipient;

    return Scaffold(
      appBar: AppBar(title: const Text("Payments")),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Orange Money Number",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "${recipient?.mobileMoneyPhone?.phoneNumber ?? ""}",
                    style: Theme.of(context).textTheme.headlineLarge!.copyWith(
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
                            "Past Payments",
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _calculatePastPayments(payments),
                            style: Theme.of(context)
                                .textTheme
                                .headlineLarge!
                                .copyWith(
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
                            "Future Payments",
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _calculateFuturePayments(payments),
                            style: Theme.of(context)
                                .textTheme
                                .headlineLarge!
                                .copyWith(
                                  color: AppColors.primaryColor,
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
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.only(bottom: 0, left: 8, right: 8),
            child: Card(
              child: Padding(
                padding: AppSpacings.h16v8,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Next payment:",
                          style:
                              Theme.of(context).textTheme.bodySmall!.copyWith(
                                    color: Colors.black,
                                  ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getNextMonth(lastPayment?.paymentAt?.toDate()),
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall!
                              .copyWith(
                                color: Colors.black,
                              ),
                        ),
                      ],
                    ),
                    const StatusIconWithText(
                      status: Status.info,
                      text: "SLE 400",
                    )
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: payments.length,
              itemBuilder: (context, index) =>
                  PaymentTile(payment: payments[index]),
            ),
          ),
        ],
      ),
    );
  }

  String _calculatePastPayments(List<SocialIncomePayment> payments) {
    var total = 0;

    for (final payment in payments) {
      total += payment.amount ?? 0;
    }

    return "${payments.first.currency} $total";
  }

  String _calculateFuturePayments(List<SocialIncomePayment> payments) {
    // total of all payments = 3 years, every month, 400 = 3 * 12 * 400 = 14400
    const allPayments = 14400;

    var currentPayments = 0;

    for (final payment in payments) {
      currentPayments += payment.amount ?? 0;
    }

    return "${payments.first.currency} ${allPayments - currentPayments}";
  }

  // TODO how should it behave if there's no payment yet?
  // Currently uses current month
  String _getNextMonth(DateTime? lastPayment) {
    if (lastPayment == null) {
      final now = DateTime.now();

      if (now.day > 15) {
        return "15. ${DateFormat('MMMM yyyy').format(now.add(const Duration(days: 30)))}";
      }

      return "15. ${DateFormat('MMMM yyyy').format(now)}";
    }
    // get month of last payment
    final month = lastPayment.month;
    final nextMonth = month + 1;

    if (nextMonth >= 12) {
      return "15. January ${lastPayment.year + 1}";
    } else {
      final date = DateTime(lastPayment.year, nextMonth, 15);
      return "${DateFormat('dd. MMMM yyyy').format(date)}";
    }
  }
}
