import "package:app/data/enums/payment_ui_status.dart";
import "package:flutter/material.dart";

const statusIconRadius = 10.0;

class PaymentStatusIcon extends StatelessWidget {
  final PaymentUiStatus status;

  const PaymentStatusIcon({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: statusIconRadius,
      backgroundColor: status.color,
      child: Icon(
        size: 14,
        status.icon,
        color: status.iconColor,
      ),
    );
  }
}
