import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/ui/configs/app_spacings.dart";
import "package:app/view/widgets/dashboard/dashboard_item.dart";
import "package:flutter/material.dart";

class WelcomeMessageCard extends DashboardItem {
  final VoidCallback onDismiss;

  const WelcomeMessageCard({required this.onDismiss, super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          children: [
            const Icon(Icons.celebration_outlined, color: AppColors.primaryColor),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                context.l10n.dashboardWelcomeMessage,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
            IconButton(
              tooltip: context.l10n.close,
              onPressed: onDismiss,
              icon: const Icon(Icons.close),
            ),
          ],
        ),
      ),
    );
  }
}
