import "package:app/core/helpers/timestamp_converter.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";
import "package:json_annotation/json_annotation.dart";

part "social_income_payment.g.dart";

@JsonSerializable()
@TimestampConverter()
class SocialIncomePayment extends Equatable {
  @JsonKey(defaultValue: "", includeToJson: false)
  final String id;
  final int? amount;

  @JsonKey(name: "payment_at")
  final Timestamp? paymentAt;
  final String? currency;
  final PaymentStatus? status;
  final String? comments;

  @JsonKey(name: "last_updated_by")
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

  factory SocialIncomePayment.fromJson(Map<String, dynamic> json) => _$SocialIncomePaymentFromJson(json);

  Map<String, dynamic> toJson() => _$SocialIncomePaymentToJson(this);

  @override
  List<Object?> get props {
    return [id, amount, paymentAt, currency, status, comments, updatedBy];
  }

  SocialIncomePayment copyWith({
    String? id,
    int? amount,
    Timestamp? paymentAt,
    String? comments,
    String? currency,
    PaymentStatus? status,
    String? updatedBy,
  }) {
    return SocialIncomePayment(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      paymentAt: paymentAt ?? this.paymentAt,
      comments: comments ?? this.comments,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      updatedBy: updatedBy ?? this.updatedBy,
    );
  }
}

enum PaymentStatus {
  @JsonValue("created")
  created,
  @JsonValue("paid")
  paid,
  @JsonValue("confirmed")
  confirmed,
  @JsonValue("contested")
  contested,
  @JsonValue("failed")
  failed,
  @JsonValue("other")
  other,
}
