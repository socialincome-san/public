import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:flutter/material.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class EmptyItem extends DashboardItem {
  const EmptyItem({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: 200),
      child: Padding(
        padding: AppSpacings.a8,
        child: Center(
          child: Text(
            localizations.dashboardUp2Date,
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
