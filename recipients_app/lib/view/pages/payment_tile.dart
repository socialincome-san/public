import "package:app/data/models/models.dart";
import "package:app/ui/icons/payment_status_icon_with_text.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

class PaymentTile extends StatelessWidget {
  final MappedPayment mappedPayment;

  const PaymentTile({super.key, required this.mappedPayment});

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
                _formatDate(mappedPayment.payment.paymentAt?.toDate()),
                style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                      color: Colors.black,
                    ),
              ),
              const SizedBox(height: 8),
              _buildStatusIcon(mappedPayment),
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

  Widget _buildStatusIcon(MappedPayment mappedPayment) {
    final text =
        "${mappedPayment.payment.currency} ${mappedPayment.payment.amount}";

    return PaymentStatusIconWithText(
      status: mappedPayment.uiStatus,
      text: text,
    );
  }
}
