import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";

class InputText extends StatefulWidget {
  final TextEditingController? controller;
  final Function(String?)? onSubmitted;
  final Function(String?)? onChanged;
  final VoidCallback? onFocusLostAndValueChanged;
  final FocusNode? focusNode;
  final String? hintText;
  final String? Function(String?)? validator;
  final VoidCallback? onTap;
  final bool isReadOnly;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final int? maxLength;

  const InputText({
    super.key,
    this.controller,
    this.onSubmitted,
    this.onChanged,
    this.onFocusLostAndValueChanged,
    this.focusNode,
    this.hintText,
    this.validator,
    this.onTap,
    this.isReadOnly = false,
    this.suffixIcon,
    this.keyboardType = TextInputType.text,
    this.maxLength,
  });

  @override
  State<InputText> createState() => _InputTextState();
}

class _InputTextState extends State<InputText> {
  late FocusNode _internalFocusNode;
  bool _isUsingExternalFocusNode = false;
  String? _initialValue;

  @override
  void initState() {
    super.initState();
    _isUsingExternalFocusNode = widget.focusNode != null;
    _internalFocusNode = widget.focusNode ?? FocusNode();
    _internalFocusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _internalFocusNode.removeListener(_onFocusChange);
    if (!_isUsingExternalFocusNode) {
      _internalFocusNode.dispose();
    }
    super.dispose();
  }

  void _onFocusChange() {
    if (_internalFocusNode.hasFocus) {
      // Store initial value when focus is gained
      _initialValue = widget.controller?.text;
    } else if (widget.onFocusLostAndValueChanged != null) {
      // Check if value has changed when focus is lost
      final currentValue = widget.controller?.text;
      final hasChanged = _initialValue != currentValue;

      if (!hasChanged) {
        return; // Don't call onFocusLost if value hasn't changed
      }

      // Only execute if validator is not set or validation is successful
      if (widget.validator == null) {
        widget.onFocusLostAndValueChanged!();
      } else {
        final validationResult = widget.validator!(currentValue);
        if (validationResult == null) {
          // null means validation successful
          widget.onFocusLostAndValueChanged!();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        TextFormField(
          decoration: InputDecoration(
            hintStyle: AppStyles.inputHint,
            // labelText: hintText,
            suffixIcon: widget.suffixIcon,
            floatingLabelBehavior: FloatingLabelBehavior.never,
            // when maxLength is added TextFormField shows counter e.g. 0/1,
            // we don't need it and one of the solutions is to provide SizedBox.shrink()
            // see https://stackoverflow.com/a/58819500
            counter: const SizedBox.shrink(),
          ),
          style: AppStyles.inputText,
          readOnly: widget.isReadOnly,
          controller: widget.controller,
          onFieldSubmitted: widget.onSubmitted,
          onChanged: widget.onChanged,
          onTap: widget.onTap,
          focusNode: _internalFocusNode,
          validator: widget.validator,
          keyboardType: widget.keyboardType,
          maxLength: widget.maxLength,
        ),
        if (widget.hintText != null)
          Positioned(
            top: 4,
            left: 12,
            child: Text(
              widget.hintText!,
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
