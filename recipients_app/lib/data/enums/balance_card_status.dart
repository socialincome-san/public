import "package:dart_mappable/dart_mappable.dart";

part "balance_card_status.mapper.dart";

@MappableEnum()
enum BalanceCardStatus {
  allConfirmed,
  recentToReview,
  needsAttention,
  onHold,
}
