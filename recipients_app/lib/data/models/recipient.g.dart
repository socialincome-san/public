// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recipient.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Recipient _$RecipientFromJson(Map<String, dynamic> json) => Recipient(
      userId: json['user_id'] as String? ?? '',
      communicationMobilePhone: json['communication_mobile_phone'] == null
          ? null
          : Phone.fromJson(
              json['communication_mobile_phone'] as Map<String, dynamic>),
      mobileMoneyPhone: json['mobile_money_phone'] == null
          ? null
          : Phone.fromJson(json['mobile_money_phone'] as Map<String, dynamic>),
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      birthDate: _$JsonConverterFromJson<Object, Timestamp>(
          json['birth_date'], const TimestampConverter().fromJson),
      email: json['email'] as String?,
      country: json['country'] as String?,
      preferredName: json['preferred_name'] as String?,
      callingName: json['calling_name'] as String?,
      paymentProvider: json['paymentProvider'] as String?,
      gender: json['gender'] as String?,
      selectedLanguage: json['main_language'] as String?,
      termsAccepted: json['terms_accepted'] as bool?,
      recipientSince: _$JsonConverterFromJson<String, DateTime>(
          json['recipient_since'], const DateTimeConverter().fromJson),
      imLinkInitial: json['im_link_initial'] as String?,
      imLinkRegular: json['im_link_regular'] as String?,
      nextSurvey: _$JsonConverterFromJson<Object, Timestamp>(
          json['next_survey'], const TimestampConverter().fromJson),
      organizationRef:
          _$JsonConverterFromJson<Object, DocumentReference<Object?>>(
              json['organisation'],
              const DocumentReferenceConverter().fromJson),
      updatedBy: json['last_updated_by'] as String?,
      successorName: json['successor'] as String?,
    );

Map<String, dynamic> _$RecipientToJson(Recipient instance) => <String, dynamic>{
      'communication_mobile_phone': instance.communicationMobilePhone?.toJson(),
      'mobile_money_phone': instance.mobileMoneyPhone?.toJson(),
      'paymentProvider': instance.paymentProvider,
      'first_name': instance.firstName,
      'last_name': instance.lastName,
      'birth_date': _$JsonConverterToJson<Object, Timestamp>(
          instance.birthDate, const TimestampConverter().toJson),
      'email': instance.email,
      'country': instance.country,
      'preferred_name': instance.preferredName,
      'calling_name': instance.callingName,
      'gender': instance.gender,
      'main_language': instance.selectedLanguage,
      'organisation': _$JsonConverterToJson<Object, DocumentReference<Object?>>(
          instance.organizationRef, const DocumentReferenceConverter().toJson),
      'terms_accepted': instance.termsAccepted,
      'recipient_since': _$JsonConverterToJson<String, DateTime>(
          instance.recipientSince, const DateTimeConverter().toJson),
      'im_link_initial': instance.imLinkInitial,
      'im_link_regular': instance.imLinkRegular,
      'next_survey': _$JsonConverterToJson<Object, Timestamp>(
          instance.nextSurvey, const TimestampConverter().toJson),
      'last_updated_by': instance.updatedBy,
      'successor': instance.successorName,
    };

Value? _$JsonConverterFromJson<Json, Value>(
  Object? json,
  Value? Function(Json json) fromJson,
) =>
    json == null ? null : fromJson(json as Json);

Json? _$JsonConverterToJson<Json, Value>(
  Value? value,
  Json? Function(Value value) toJson,
) =>
    value == null ? null : toJson(value);
