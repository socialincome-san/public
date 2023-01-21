import "dart:convert";

import "package:cloud_firestore/cloud_firestore.dart";
import "package:equatable/equatable.dart";

class SocialIncomeUser extends Equatable {
  final String userId;
  final Phone? communicationMobilePhone;
  final Phone? mobileMoneyPhone;
  final String? firstName;
  final String? lastName;
  final Timestamp? birthDate;
  final String? email;
  final String? country;
  final String? preferredName;

  final bool? termsAccepted;
  final DateTime? recipientSince;
  final String? imLinkInitial;

  const SocialIncomeUser({
    required this.userId,
    required this.communicationMobilePhone,
    this.mobileMoneyPhone,
    this.firstName,
    this.lastName,
    this.birthDate,
    this.email,
    this.country,
    this.preferredName,
    this.termsAccepted,
    this.recipientSince,
    this.imLinkInitial,
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
      termsAccepted,
      recipientSince,
      imLinkInitial,
    ];
  }

  factory SocialIncomeUser.fromMap(Map<String, dynamic> map) {
    return SocialIncomeUser(
      userId: map["user_id"] as String,
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
      termsAccepted:
          // ignore: avoid_bool_literals_in_conditional_expressions
          map["terms_accepted"] != null ? map["terms_accepted"] as bool : false,
      recipientSince: map["recipient_since"] != null
          ? DateTime.fromMillisecondsSinceEpoch(map["recipient_since"] as int)
          : null,
      imLinkInitial: map["im_link_initial"] as String?,
    );
  }

  SocialIncomeUser copyWith({
    String? userId,
    Phone? communicationMobilePhone,
    Phone? mobileMoneyPhone,
    String? firstName,
    String? lastName,
    Timestamp? birthDate,
    String? email,
    String? country,
    String? preferredName,
    bool? termsAccepted,
    DateTime? recipientSince,
    String? imLinkInitial,
  }) {
    return SocialIncomeUser(
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
      termsAccepted: termsAccepted ?? this.termsAccepted,
      recipientSince: recipientSince ?? this.recipientSince,
      imLinkInitial: imLinkInitial ?? this.imLinkInitial,
    );
  }
}

class Phone {
  final int phone;

  Phone(this.phone);

  factory Phone.fromMap(Map<String, dynamic> map) {
    return Phone(
      map["phone"] as int,
    );
  }

  factory Phone.fromJson(String source) =>
      Phone.fromMap(json.decode(source) as Map<String, dynamic>);
}
