import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class UnchangeableUserInformation extends StatefulWidget {
  final String section;
  final String placeHolder;

  const UnchangeableUserInformation({
    required this.section,
    required this.placeHolder,
    super.key,
  });

  @override
  State<UnchangeableUserInformation> createState() =>
      _UnchangeableUserInformationState();
}

class _UnchangeableUserInformationState
    extends State<UnchangeableUserInformation> {
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
    return Container(
      constraints: const BoxConstraints(
        maxHeight: 39,
        minHeight: 39,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Expanded(
            flex: 3,
            child: Container(
              padding: AppSpacings.a8,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(6),
                  bottomLeft: Radius.circular(6),
                ),
              ),
              child: Text(
                widget.section,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.darkGrey,
                    ),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: AppSpacings.a8,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topRight: Radius.circular(6),
                  bottomRight: Radius.circular(6),
                ),
              ),
              child: Text(widget.placeHolder),
            ),
          ),
        ],
      ),
    );
  }
}
