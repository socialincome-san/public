import "package:app/ui/configs/app_colors.dart";
import "package:flutter/material.dart";

enum PaymentUiStatus {
  /// blue label, white font, confirm icon
  confirmed(color: AppColors.primaryColor, icon: Icons.check_rounded, textColor: Colors.white, iconColor: Colors.white),

  /// yellow label, dark font, warning icon
  contested(
    color: AppColors.yellowColor,
    icon: Icons.priority_high_rounded,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.fontColorDark,
  ),

  /// yellow label, dark font, warning icon
  toReview(
    color: AppColors.yellowColor,
    icon: Icons.priority_high_rounded,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.fontColorDark,
  ),

  /// blue label, white font, question mark icon
  recentToReview(
    color: AppColors.primaryColor,
    icon: Icons.question_mark_rounded,
    textColor: Colors.white,
    iconColor: Colors.white,
  ),

  /// red label, dark font, close icon
  onHoldContested(
    color: AppColors.redColor,
    icon: Icons.close_rounded,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.fontColorDark,
  ),

  /// red label, dark font, close icon
  onHoldToReview(
    color: AppColors.redColor,
    icon: Icons.close_rounded,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.fontColorDark,
  ),

  /// backgroundColor label, dark font, no visbible icon (That's why iconColor is same as color)
  toBePaid(
    color: AppColors.backgroundColor,
    icon: Icons.timer_outlined,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.backgroundColor,
  ),

  /// backgroundColor label, dark font, no visbible icon (That's why iconColor is same as color)
  empty(
    color: AppColors.backgroundColor,
    icon: Icons.question_mark_rounded,
    textColor: AppColors.fontColorDark,
    iconColor: AppColors.backgroundColor,
  );

  final Color color;
  final IconData icon;
  final Color textColor;
  final Color iconColor;

  const PaymentUiStatus({required this.color, required this.icon, required this.textColor, required this.iconColor});
}
