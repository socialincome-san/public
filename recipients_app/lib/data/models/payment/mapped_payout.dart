import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/payout.dart";
import "package:dart_mappable/dart_mappable.dart";

part "mapped_payout.mapper.dart";

@MappableClass()
class MappedPayout with MappedPayoutMappable {
  final Payout payout;
  final PayoutUiStatus uiStatus;

  const MappedPayout({
    required this.payout,
    required this.uiStatus,
  });
}
