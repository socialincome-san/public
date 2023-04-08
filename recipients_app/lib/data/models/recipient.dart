import "dart:convert";

import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";

class Recipient extends Equatable {
  final String userId;
  final Phone? communicationMobilePhone;
  final Phone? mobileMoneyPhone;
  final String? firstName;
  final String? lastName;
  final Timestamp? birthDate;
  final String? email;
  final String? country;
  final String? preferredName;
  final String? gender;
  final String? selectedLanguage;
  final String? paymentProvider;

  final bool? termsAccepted;
  final DateTime? recipientSince;
  final String? imLinkInitial;
  final String? imLinkRegular;
  final Timestamp? nextSurvey;

  // this should be got from `/recipients/<recipient.id>/payments` collection
  final List<SocialIncomePayment>? payments;

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
    this.paymentProvider,
    this.gender,
    this.selectedLanguage,
    this.termsAccepted,
    this.recipientSince,
    this.imLinkInitial,
    this.imLinkRegular,
    this.nextSurvey,
    this.payments = const [],
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
      selectedLanguage,
      gender,
      paymentProvider,
      termsAccepted,
      recipientSince,
      imLinkInitial,
      imLinkRegular,
      nextSurvey,
      payments,
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
    String? gender,
    String? paymentProvider,
    String? selectedLanguage,
    bool? termsAccepted,
    DateTime? recipientSince,
    String? imLinkInitial,
    String? imLinkRegular,
    Timestamp? nextSurvey,
    List<SocialIncomePayment>? payments,
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
      gender: gender ?? this.gender,
      paymentProvider: paymentProvider ?? this.paymentProvider,
      selectedLanguage: selectedLanguage ?? this.selectedLanguage,
      termsAccepted: termsAccepted ?? this.termsAccepted,
      recipientSince: recipientSince ?? this.recipientSince,
      imLinkInitial: imLinkInitial ?? this.imLinkInitial,
      imLinkRegular: imLinkRegular ?? this.imLinkRegular,
      nextSurvey: nextSurvey ?? this.nextSurvey,
      payments: payments ?? this.payments,
    );
  }

  // TODO FIX THIS!
  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    result.addAll({"user_id": userId});
    if (communicationMobilePhone != null) {
      result.addAll(
        {"communication_mobile_phone": communicationMobilePhone!.toMap()},
      );
    }

    if (mobileMoneyPhone != null) {
      result.addAll({"mobile_money_phone": mobileMoneyPhone!.toMap()});
    }

    if (paymentProvider != null) {
      result.addAll({"paymentProvider": paymentProvider});
    }

    if (firstName != null) {
      result.addAll({"first_name": firstName});
    }

    if (lastName != null) {
      result.addAll({"last_name": lastName});
    }

    if (birthDate != null) {
      result.addAll({"birth_date": birthDate});
    }

    if (email != null) {
      result.addAll({"email": email});
    }

    if (country != null) {
      result.addAll({"country": country});
    }

    if (preferredName != null) {
      result.addAll({"preferred_name": preferredName});
    }

    if (gender != null) {
      result.addAll({"gender": gender});
    }

    if (selectedLanguage != null) {
      result.addAll({"selected_language": selectedLanguage});
    }

    if (termsAccepted != null) {
      result.addAll({"terms_accepted": termsAccepted});
    }

    if (recipientSince != null) {
      result
          .addAll({"recipient_since": recipientSince!.millisecondsSinceEpoch});
    }

    if (imLinkInitial != null) {
      result.addAll({"im_link_initial": imLinkInitial});
    }

    if (imLinkInitial != null) {
      result.addAll({"im_link_regular": imLinkRegular});
    }

    if (nextSurvey != null) {
      result.addAll({"next_survey": nextSurvey});
    }

    return result;
  }

  factory Recipient.fromMap(String userId, Map<String, dynamic> map) {
    return Recipient(
      userId: userId,
      communicationMobilePhone: map["communication_mobile_phone"] != null
          ? Phone.fromMap(
              map["communication_mobile_phone"] as Map<String, dynamic>,
            )
          : null,
      mobileMoneyPhone: map["mobile_money_phone"] != null
          ? Phone.fromMap(map["mobile_money_phone"] as Map<String, dynamic>)
          : null,
      firstName: map["first_name"] as String?,
      lastName: map["last_name"] as String?,
      birthDate:
          map["birth_date"] != null ? map["birth_date"] as Timestamp : null,
      email: map["email"] as String?,
      country: map["country"] as String?,
      preferredName: map["preferred_name"] as String?,
      gender: map["gender"] as String?,
      paymentProvider: map["paymentProvider"] as String?,
      selectedLanguage: map["selected_language"] as String?,
      termsAccepted:
          // ignore: avoid_bool_literals_in_conditional_expressions
          map["terms_accepted"] != null ? map["terms_accepted"] as bool : false,
      recipientSince: map["recipient_since"] != null
          ? DateTime.fromMillisecondsSinceEpoch(map["recipient_since"] as int)
          : null,
      imLinkInitial: map["im_link_initial"] as String?,
      imLinkRegular: map["im_link_regular"] as String?,
      nextSurvey:
          map["next_survey"] != null ? map["next_survey"] as Timestamp : null,
    );
  }

  String toJson() => json.encode(toMap());

  /// TODO this should not be in the model
  int totalIncome() {
    int sum = 0;

    for (final SocialIncomePayment element in payments ?? List.empty()) {
      final amount = element.amount;
      if (element.status != PaymentStatus.confirmed || amount == null) continue;

      final int factor = (element.currency == "SLL") ? 1000 : 1;
      sum += (amount / factor).floor();
    }

    return sum;
  }
}
