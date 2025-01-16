// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'social_income_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SocialIncomePayment _$SocialIncomePaymentFromJson(Map<String, dynamic> json) =>
    SocialIncomePayment(
      id: json['id'] as String? ?? '',
      amount: (json['amount'] as num?)?.toInt(),
      paymentAt: _$JsonConverterFromJson<Object, Timestamp>(
          json['payment_at'], const TimestampConverter().fromJson),
      currency: json['currency'] as String?,
      status: $enumDecodeNullable(_$PaymentStatusEnumMap, json['status']),
      comments: json['comments'] as String?,
      updatedBy: json['last_updated_by'] as String?,
    );

Map<String, dynamic> _$SocialIncomePaymentToJson(
        SocialIncomePayment instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'payment_at': _$JsonConverterToJson<Object, Timestamp>(
          instance.paymentAt, const TimestampConverter().toJson),
      'currency': instance.currency,
      'status': _$PaymentStatusEnumMap[instance.status],
      'comments': instance.comments,
      'last_updated_by': instance.updatedBy,
    };

Value? _$JsonConverterFromJson<Json, Value>(
  Object? json,
  Value? Function(Json json) fromJson,
) =>
    json == null ? null : fromJson(json as Json);

const _$PaymentStatusEnumMap = {
  PaymentStatus.created: 'created',
  PaymentStatus.paid: 'paid',
  PaymentStatus.confirmed: 'confirmed',
  PaymentStatus.contested: 'contested',
  PaymentStatus.failed: 'failed',
  PaymentStatus.other: 'other',
};

Json? _$JsonConverterToJson<Json, Value>(
  Value? value,
  Json? Function(Value value) toJson,
) =>
    value == null ? null : toJson(value);
