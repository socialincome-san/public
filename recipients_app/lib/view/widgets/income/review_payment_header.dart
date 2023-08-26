import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class ReviewPaymentModalHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(localizations.contestPayment),
            GestureDetector(
              onTap: () {
                Navigator.pop(context);
              },
              child: const CircleAvatar(
                radius: 14,
                backgroundColor: AppColors.lightGrey,
                child: Icon(
                  size: 18,
                  Icons.close,
                  color: AppColors.fontColorDark,
                ),
              ),
            ),
          ],
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.only(top: 24),
            child: Text(
              localizations.contestPaymentInfo,
              textAlign: TextAlign.center,
              style: AppStyles.headlineLarge.copyWith(
                color: AppColors.primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
