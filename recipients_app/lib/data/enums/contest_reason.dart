import "package:app/l10n/arb/app_localizations.dart";

enum ContestReason {
  phoneStolen,
  incorrectAmount,
  numberChanged,
  other;
}

extension ContestReasonLocalization on ContestReason {
  /// Returns the localized title for the contest reason.
  /// Requires an instance of [AppLocalizations] to access the localized strings.
  String localized(AppLocalizations l10n) {
    switch (this) {
      case ContestReason.phoneStolen:
        return l10n.contestReason_phoneStolen;
      case ContestReason.incorrectAmount:
        return l10n.contestReason_incorrectAmount;
      case ContestReason.numberChanged:
        return l10n.contestReason_numberChanged;
      case ContestReason.other:
        return l10n.contestReason_otherReason;
    }
  }
}
