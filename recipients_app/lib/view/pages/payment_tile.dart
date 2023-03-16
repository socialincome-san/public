import "package:app/data/models/models.dart";
import "package:app/ui/icons/icons.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

class PaymentTile extends StatelessWidget {
  final SocialIncomePayment payment;

  const PaymentTile({super.key, required this.payment});

  @override
  Widget build(BuildContext context) {
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
                style: Theme.of(context).textTheme.headlineSmall!.copyWith(
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
  }

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return "";
    return DateFormat("MMMM yyyy").format(dateTime);
  }
}
