import "package:dart_mappable/dart_mappable.dart";

part "payout_params.mapper.dart";

@MappableClass()
class PayoutParams with PayoutParamsMappable {
  final String payoutId;

  const PayoutParams({
    required this.payoutId,
  });
}
