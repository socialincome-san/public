import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:flutter/material.dart";

class EmptyItem extends DashboardItem {
  const EmptyItem({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: 200),
      child: Padding(
        padding: AppSpacings.a8,
        child: Center(child: Text(context.l10n.dashboardUp2Date, textAlign: TextAlign.center)),
      ),
    );
  }
}
