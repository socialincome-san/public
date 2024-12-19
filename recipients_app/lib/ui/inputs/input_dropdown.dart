import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class InputDropdown<T> extends StatefulWidget {
  final String label;
  final List<DropdownMenuItem<T>> items;
  final String? Function(T?)? validator;
  final Function(T?) onChanged;
  final T? value;

  const InputDropdown({
    super.key,
    required this.label,
    required this.items,
    required this.validator,
    required this.onChanged,
    this.value,
  });

  @override
  State<InputDropdown<T>> createState() => _InputDropdownState<T>();
}

class _InputDropdownState<T> extends State<InputDropdown<T>> {
  T? value;

  @override
  void initState() {
    super.initState();
    value = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        DropdownButtonFormField<T>(
          iconEnabledColor: AppColors.primaryColor,
          icon: const Icon(
            Icons.expand_more_rounded,
            size: 24,
          ),
          decoration: InputDecoration(
            floatingLabelBehavior: FloatingLabelBehavior.never,
            contentPadding: AppSpacings.h12v16,
            label: Text(widget.label),
            labelStyle: AppStyles.inputHint.copyWith(
              color: AppColors.darkGrey.withValues(alpha: 0.6),
              fontWeight: FontWeight.bold,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
            ),
          ),
          items: widget.items,
          value: value,
          style: AppStyles.inputHint.copyWith(
            color: AppColors.primaryColor,
            fontWeight: FontWeight.bold,
          ),
          onChanged: (newValue) {
            setState(() {
              value = newValue;
            });
            widget.onChanged(newValue);
          },
          validator: widget.validator,
        ),
        if (value != null)
          Positioned(
            top: 4,
            left: 12,
            child: Text(
              widget.label,
              style: AppStyles.inputHint.copyWith(
                color: AppColors.darkGrey.withValues(alpha: 0.6),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }
}
