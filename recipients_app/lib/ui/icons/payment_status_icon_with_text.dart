import "package:app/data/models/payment/payment.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

const statusIconHeight = 20.0;

class PaymentStatusIconWithText extends StatelessWidget {
  final PaymentUiStatus status;
  final String text;
  final bool isInverted;

  const PaymentStatusIconWithText({
    super.key,
    required this.status,
    required this.text,
    this.isInverted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacings.h8,
      decoration: BoxDecoration(
        color: status.color,
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
      ),
      height: statusIconHeight,
      child: Row(
        children: [
          Text(
            text,
            style: AppStyles.iconLabel.copyWith(
              color: status.textColor,
            ),
          ),
          const SizedBox(width: 4),
          Icon(
            size: 14,
            status.icon,
            color: status.iconColor,
          ),
        ],
      ),
    );
  }
}
