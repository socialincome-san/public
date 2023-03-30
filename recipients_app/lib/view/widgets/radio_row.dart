import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/ui/configs/app_styles.dart";
import "package:flutter/material.dart";

class RadioRow<T> extends StatelessWidget {
  final T value;
  final T groupValue;
  final String title;
  final ValueChanged<T?> onChanged;

  const RadioRow({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.onChanged,
    super.key,
  });

  @override
  Widget build(BuildContext) {
    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: () {
          onChanged(value);
        },
        child: Padding(
          padding: AppSpacings.a4,
          child: Ink(
            child: Row(
              children: [
                Container(
                  height: 28,
                  width: 28,
                  decoration: BoxDecoration(
                    border: Border.all(width: 1),
                    borderRadius: const BorderRadius.all(
                      Radius.circular(100),
                    ),
                  ),
                  child: groupValue == value
                      ? const Icon(
                          Icons.circle,
                          size: 16,
                          color: AppColors.primaryColor,
                        )
                      : null,
                ),
                const SizedBox(width: 14),
                Text(
                  title,
                  style: AppStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
