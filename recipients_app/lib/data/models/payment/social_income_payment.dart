import "package:cloud_firestore/cloud_firestore.dart";
import "package:dart_mappable/dart_mappable.dart";

part "social_income_payment.mapper.dart";

// @JsonSerializable()
// @TimestampConverter()
@MappableClass()
class SocialIncomePayment with SocialIncomePaymentMappable {
  // @MappableField(defaultValue: "", includeToJson: false)
  final String id;
  final int? amount;

  // @JsonKey(name: "payment_at")
  final Timestamp? paymentAt;
  final String? currency;
  final PaymentStatus? status;
  final String? comments;

  // @JsonKey(name: "last_updated_by")
  final String? updatedBy;

  const SocialIncomePayment({
    required this.id,
    this.amount,
    this.paymentAt,
    this.currency,
    this.status,
    this.comments,
    this.updatedBy,
  });
}

@MappableEnum()
enum PaymentStatus {
  // @JsonValue("created")
  created,
  // @JsonValue("paid")
  paid,
  // @JsonValue("confirmed")
  confirmed,
  // @JsonValue("contested")
  contested,
  // @JsonValue("failed")
  failed,
  // @JsonValue("other")
  other,
}
