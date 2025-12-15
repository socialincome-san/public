import "package:dart_mappable/dart_mappable.dart";

part "payout_status.mapper.dart";

@MappableEnum()
enum PayoutStatus {
  created,
  paid,
  confirmed,
  contested,
  failed,
  other,
}
