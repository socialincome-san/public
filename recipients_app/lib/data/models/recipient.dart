import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient.mapper.dart";

// @JsonSerializable(explicitToJson: true)
// @TimestampConverter()
// @DocumentReferenceConverter()
// @DateTimeConverter()
@MappableClass()
class Recipient with RecipientMappable {
  // @JsonKey(name: "user_id", defaultValue: "", includeToJson: false)
  final String userId;

  // @JsonKey(name: "communication_mobile_phone")
  final Phone? communicationMobilePhone;

  // @JsonKey(name: "mobile_money_phone")
  final Phone? mobileMoneyPhone;

  // @JsonKey(name: "paymentProvider")
  final String? paymentProvider;

  // @JsonKey(name: "first_name")
  final String? firstName;

  // @JsonKey(name: "last_name")
  final String? lastName;

  // @JsonKey(name: "birth_date")
  final Timestamp? birthDate;

  // @JsonKey(name: "email")
  final String? email;

  // @JsonKey(name: "country")
  final String? country;

  // @JsonKey(name: "preferred_name")
  final String? preferredName;

  // @JsonKey(name: "calling_name")
  final String? callingName;

  // @JsonKey(name: "gender")
  final String? gender;

  // @JsonKey(name: "main_language")
  final String? selectedLanguage;

  // @JsonKey(name: "organisation")
  final DocumentReference? organizationRef;

  // @JsonKey(name: "terms_accepted")
  final bool? termsAccepted;

  // @JsonKey(name: "recipient_since")
  final DateTime? recipientSince;

  // @JsonKey(name: "im_link_initial")
  final String? imLinkInitial;

  // @JsonKey(name: "im_link_regular")
  final String? imLinkRegular;

  // @JsonKey(name: "next_survey")
  final Timestamp? nextSurvey;

  // @JsonKey(name: "last_updated_by")
  final String? updatedBy;

  // @JsonKey(name: "successor")
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
}
