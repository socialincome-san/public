import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/models.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/icons/icons.dart";
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
          const SizedBox(height: 24),
          Expanded(
            child: ListView.builder(
              itemCount: payments.length,
              itemBuilder: (context, index) {
                final payment = payments[index];

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            // _formatDate(payment.confirmAt?.toDate()),
                            _formatDate(payment.paymentAt?.toDate()),
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall!
                                .copyWith(
                                  color: Colors.black,
                                ),
                          ),
                          const SizedBox(height: 8),
                          StatusIconWithText(
                            status: Status.success,
                            text: "${payment.currency} ${payment.amount}",
                          )
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return "";
    return DateFormat("MMMM yyyy").format(dateTime);
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
}
