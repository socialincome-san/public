import "dart:convert";

import "package:app/core/helpers/date_time_converter.dart";
import "package:app/core/helpers/document_reference_converter.dart";
import "package:app/core/helpers/timestamp_converter.dart";
import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";
import "package:json_annotation/json_annotation.dart";

part "recipient.g.dart";

@JsonSerializable(explicitToJson: true)
@TimestampConverter()
@DocumentReferenceConverter()
@DateTimeConverter()
class Recipient extends Equatable {
  @JsonKey(name: "user_id", defaultValue: "", includeToJson: false)
  final String userId;

  @JsonKey(name: "communication_mobile_phone")
  final Phone? communicationMobilePhone;

  @JsonKey(name: "mobile_money_phone")
  final Phone? mobileMoneyPhone;

  @JsonKey(name: "paymentProvider")
  final String? paymentProvider;

  @JsonKey(name: "first_name")
  final String? firstName;

  @JsonKey(name: "last_name")
  final String? lastName;

  @JsonKey(name: "birth_date")
  final Timestamp? birthDate;

  @JsonKey(name: "email")
  final String? email;

  @JsonKey(name: "country")
  final String? country;

  @JsonKey(name: "preferred_name")
  final String? preferredName;

  @JsonKey(name: "calling_name")
  final String? callingName;

  @JsonKey(name: "gender")
  final String? gender;

  @JsonKey(name: "main_language")
  final String? selectedLanguage;

  @JsonKey(name: "organisation")
  final DocumentReference? organizationRef;

  @JsonKey(name: "terms_accepted")
  final bool? termsAccepted;

  @JsonKey(name: "recipient_since")
  final DateTime? recipientSince;

  @JsonKey(name: "im_link_initial")
  final String? imLinkInitial;

  @JsonKey(name: "im_link_regular")
  final String? imLinkRegular;

  @JsonKey(name: "next_survey")
  final Timestamp? nextSurvey;

  @JsonKey(name: "last_updated_by")
  final String? updatedBy;

  @JsonKey(name: "successor")
  final String? successorName;

  const Recipient({
    required this.userId,
    required this.communicationMobilePhone,
    this.mobileMoneyPhone,
    this.firstName,
    this.lastName,
    this.birthDate,
    this.email,
    this.country,
    this.preferredName,
    this.callingName,
    this.paymentProvider,
    this.gender,
    this.selectedLanguage,
    this.termsAccepted,
    this.recipientSince,
    this.imLinkInitial,
    this.imLinkRegular,
    this.nextSurvey,
    this.organizationRef,
    this.updatedBy,
    this.successorName,
  });

  @override
  List<Object?> get props {
    return [
      userId,
      communicationMobilePhone,
      mobileMoneyPhone,
      firstName,
      lastName,
      birthDate,
      email,
      country,
      preferredName,
      callingName,
      selectedLanguage,
      gender,
      paymentProvider,
      termsAccepted,
      recipientSince,
      imLinkInitial,
      imLinkRegular,
      nextSurvey,
      organizationRef,
      updatedBy,
      successorName,
    ];
  }

  Recipient copyWith({
    String? userId,
    Phone? communicationMobilePhone,
    Phone? mobileMoneyPhone,
    String? firstName,
    String? lastName,
    Timestamp? birthDate,
    String? email,
    String? country,
    String? preferredName,
    String? callingName,
    String? gender,
    String? paymentProvider,
    String? selectedLanguage,
    bool? termsAccepted,
    DateTime? recipientSince,
    String? imLinkInitial,
    String? imLinkRegular,
    Timestamp? nextSurvey,
    DocumentReference? organizationRef,
    String? updatedBy,
    String? successorName,
  }) {
    return Recipient(
      userId: userId ?? this.userId,
      communicationMobilePhone:
          communicationMobilePhone ?? this.communicationMobilePhone,
      mobileMoneyPhone: mobileMoneyPhone ?? this.mobileMoneyPhone,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      birthDate: birthDate ?? this.birthDate,
      email: email ?? this.email,
      country: country ?? this.country,
      preferredName: preferredName ?? this.preferredName,
      callingName: callingName ?? this.callingName,
      gender: gender ?? this.gender,
      paymentProvider: paymentProvider ?? this.paymentProvider,
      selectedLanguage: selectedLanguage ?? this.selectedLanguage,
      termsAccepted: termsAccepted ?? this.termsAccepted,
      recipientSince: recipientSince ?? this.recipientSince,
      imLinkInitial: imLinkInitial ?? this.imLinkInitial,
      imLinkRegular: imLinkRegular ?? this.imLinkRegular,
      nextSurvey: nextSurvey ?? this.nextSurvey,
      organizationRef: organizationRef ?? this.organizationRef,
      updatedBy: updatedBy ?? this.updatedBy,
      successorName: successorName ?? this.successorName,
    );
  }

  factory Recipient.fromJson(String source) =>
      Recipient.fromMap(json.decode(source) as Map<String, dynamic>);

  factory Recipient.fromMap(Map<String, dynamic> map) =>
      _$RecipientFromJson(map);

  Map<String, dynamic> toJson() => _$RecipientToJson(this);
}
