import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class UnchangeableUserInformation extends StatefulWidget {
  final String section;
  final String placeHolder;

  const UnchangeableUserInformation({required this.section, required this.placeHolder, super.key});

  @override
  State<UnchangeableUserInformation> createState() => _UnchangeableUserInformationState();
}

class _UnchangeableUserInformationState extends State<UnchangeableUserInformation> {
  late final TextEditingController controller;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            widget.section,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.darkGrey),
          ),
        ),
        Expanded(child: Text(widget.placeHolder)),
      ],
    );
  }
}
