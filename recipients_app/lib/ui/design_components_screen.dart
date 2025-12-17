import "package:app/data/enums/payout_ui_status.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/icons/icons.dart";
import "package:app/ui/inputs/input_text.dart";
import "package:app/ui/inputs/input_text_area.dart";
import "package:flutter/material.dart";

class DesignComponentsScreen extends StatelessWidget {
  const DesignComponentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Design Components"),
      ),
      body: SingleChildScrollView(
        padding: AppSpacings.a16,
        child: Column(
          children: [
            const Text(
              "Status Icons",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            const Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                PaymentStatusIcon(
                  status: PayoutUiStatus.confirmed,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.contested,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.onHoldContested,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.onHoldToReview,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.recentToReview,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.toBePaid,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.empty,
                ),
                SizedBox(height: 5),
                PaymentStatusIcon(
                  status: PayoutUiStatus.toReview,
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Status Icons Inverted",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            const ColoredBox(
              color: AppColors.primaryColor,
              child: Column(
                children: [
                  SizedBox(height: 8),
                  Row(
                    // StatusIcon(status: Status.success, isInverted: true),
                    // StatusIcon(status: Status.warning, isInverted: true),
                    // StatusIcon(status: Status.error, isInverted: true),
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  ),
                  SizedBox(height: 8),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              "Status Icons with Text",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            const Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.confirmed,
                  text: "Confirmed",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.contested,
                  text: "Contested",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.onHoldContested,
                  text: "On Hold contested",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.onHoldToReview,
                  text: "On Hold to review",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.recentToReview,
                  text: "Recent To Review",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.toBePaid,
                  text: "To Be Paid",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.empty,
                  text: "Empty",
                ),
                SizedBox(height: 5),
                PaymentStatusIconWithText(
                  status: PayoutUiStatus.toReview,
                  text: "To Review",
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Buttons Big",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ButtonOutlinedBig(
                  onPressed: () {},
                  label: "Text",
                ),
                ButtonBig(
                  onPressed: () {},
                  label: "Text",
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Buttons Small",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ButtonSmall(
                  onPressed: () {},
                  label: "Text",
                  buttonType: ButtonSmallType.outlined,
                ),
                ButtonSmall(
                  onPressed: () {},
                  label: "Text",
                  color: Colors.black,
                  fontColor: Colors.white,
                  buttonType: ButtonSmallType.filled,
                ),
                ButtonSmall(
                  onPressed: () {},
                  label: "Text",
                  buttonType: ButtonSmallType.filled,
                  fontColor: Colors.white,
                ),
                ButtonSmall(
                  onPressed: () {},
                  label: "Text",
                  color: AppColors.yellowColor,
                  buttonType: ButtonSmallType.filled,
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Text Input",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            const InputText(
              hintText: "Help",
            ),
            const SizedBox(height: 32),
            const Text(
              "Text Input Area",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            const InputTextArea(
              hintText: "Help",
            ),
          ],
        ),
      ),
    );
  }
}
