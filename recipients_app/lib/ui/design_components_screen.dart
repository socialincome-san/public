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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: const [
                StatusIcon(status: Status.success),
                StatusIcon(status: Status.warning),
                StatusIcon(status: Status.error),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Status Icons Inverted",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            ColoredBox(
              color: AppColors.primaryColor,
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: const [
                      StatusIcon(status: Status.success, isInverted: true),
                      StatusIcon(status: Status.warning, isInverted: true),
                      StatusIcon(status: Status.error, isInverted: true),
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              "Status Icons with Text",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: const [
                StatusIconWithText(status: Status.success, text: "Success"),
                StatusIconWithText(status: Status.warning, text: "Warning"),
                StatusIconWithText(status: Status.error, text: "Error"),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "Status Icons with Text Inverted",
              style: AppStyles.headlineLarge,
            ),
            const SizedBox(height: 16),
            ColoredBox(
              color: AppColors.darkGrey,
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: const [
                      StatusIconWithText(
                        status: Status.success,
                        text: "Success",
                        isInverted: true,
                      ),
                      StatusIconWithText(
                        status: Status.warning,
                        text: "Warning",
                        isInverted: true,
                      ),
                      StatusIconWithText(
                        status: Status.error,
                        text: "Error",
                        isInverted: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
              ),
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
