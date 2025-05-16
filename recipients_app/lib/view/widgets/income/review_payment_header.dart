import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class ReviewPaymentModalHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(context.l10n.contestPayment),
            GestureDetector(
              onTap: () {
                Navigator.pop(context);
              },
              child: const CircleAvatar(
                radius: 14,
                backgroundColor: AppColors.lightGrey,
                child: Icon(size: 18, Icons.close, color: AppColors.fontColorDark),
              ),
            ),
          ],
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.only(top: 24),
            child: Text(
              context.l10n.contestPaymentInfo,
              textAlign: TextAlign.center,
              style: AppStyles.headlineLarge.copyWith(color: AppColors.primaryColor, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}
