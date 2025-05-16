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
  Widget build(BuildContext context) {
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
                  height: 40,
                  width: 40,
                  padding: AppSpacings.a8,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primaryColor),
                    borderRadius: const BorderRadius.all(Radius.circular(100)),
                  ),
                  child:
                      groupValue == value
                          ? const CircleAvatar(
                            backgroundColor: AppColors.primaryColor,
                            radius: 10,
                            child: Icon(Icons.check_rounded, size: 14, color: Colors.white),
                          )
                          : null,
                ),
                const SizedBox(width: 14),
                Text(
                  title,
                  style: AppStyles.headlineMedium.copyWith(fontWeight: FontWeight.bold, color: AppColors.primaryColor),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
