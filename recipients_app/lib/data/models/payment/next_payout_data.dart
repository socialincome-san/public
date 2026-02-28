import "package:app/data/models/currency.dart";
import "package:dart_mappable/dart_mappable.dart";

part "next_payout_data.mapper.dart";

@MappableClass()
class NextPayoutData with NextPayoutDataMappable {
  final int amount;
  final Currency currency;
  final int daysToPayout;

  const NextPayoutData({
    required this.amount,
    required this.currency,
    required this.daysToPayout,
  });
}
