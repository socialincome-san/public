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

  final bool? termsAccepted;
  final DateTime? recipientSince;
  final String? imLinkInitial;
  final String? imLinkRegular;

  final List<SocialIncomeTransaction>? transactions;

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
    this.termsAccepted,
    this.recipientSince,
    this.imLinkInitial,
    this.imLinkRegular,
    this.transactions = const [],
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
      imLinkRegular,
      transactions,
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
    bool? termsAccepted,
    DateTime? recipientSince,
    String? imLinkInitial,
    String? imLinkRegular,
    List<SocialIncomeTransaction>? transactions,
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
      termsAccepted: termsAccepted ?? this.termsAccepted,
      recipientSince: recipientSince ?? this.recipientSince,
      imLinkInitial: imLinkInitial ?? this.imLinkInitial,
      imLinkRegular: imLinkRegular ?? this.imLinkRegular,
      transactions: transactions ?? this.transactions,
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
    if (transactions != null) {
      result.addAll(
        {
          "transactions": transactions!
              .map(
                (element) => element.toMap(),
              )
              .toList()
        },
      );
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
      termsAccepted:
          // ignore: avoid_bool_literals_in_conditional_expressions
          map["terms_accepted"] != null ? map["terms_accepted"] as bool : false,
      recipientSince: map["recipient_since"] != null
          ? DateTime.fromMillisecondsSinceEpoch(map["recipient_since"] as int)
          : null,
      imLinkInitial: map["im_link_initial"] as String?,
      imLinkRegular: map["im_link_regular"] as String?,
      transactions: map["transactions"] != null
          ? (map["transactions"] as List)
              .map(
                (e) =>
                    SocialIncomeTransaction.fromMap(e as Map<String, dynamic>),
              )
              .toList()
          : null,
    );
  }

  String toJson() => json.encode(toMap());

  // TODO FIX THIS
/*   factory Recipient.fromJson(String source) =>
      Recipient.fromMap(jsonDecode(source) as Map<String, dynamic>); */
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

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    result.addAll({"phone": phone});

    return result;
  }
}
