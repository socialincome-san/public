// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'social_income_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SocialIncomePayment _$SocialIncomePaymentFromJson(Map<String, dynamic> json) =>
    SocialIncomePayment(
      id: json['id'] as String? ?? '',
      amount: json['amount'] as int?,
      paymentAt: const TimestampConverter().fromJson(json['payment_at']),
      currency: json['currency'] as String?,
      status: $enumDecodeNullable(_$PaymentStatusEnumMap, json['status']),
      comments: json['comments'] as String?,
    );

Map<String, dynamic> _$SocialIncomePaymentToJson(
        SocialIncomePayment instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount': instance.amount,
      'payment_at': const TimestampConverter().toJson(instance.paymentAt),
      'currency': instance.currency,
      'status': _$PaymentStatusEnumMap[instance.status],
      'comments': instance.comments,
    };

const _$PaymentStatusEnumMap = {
  PaymentStatus.created: 'created',
  PaymentStatus.paid: 'paid',
  PaymentStatus.confirmed: 'confirmed',
  PaymentStatus.contested: 'contested',
  PaymentStatus.failed: 'failed',
  PaymentStatus.other: 'other',
};
