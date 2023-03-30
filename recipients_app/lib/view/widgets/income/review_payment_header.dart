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
            const Text("Contest payment"),
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
              "A payment has not reached you. What happened?",
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
