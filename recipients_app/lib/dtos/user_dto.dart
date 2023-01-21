import "package:app/account/repository/user_account.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const communicationPhoneKey = "communication_mobile_phone";
const moneyPhoneKey = "mobile_money_phone";
const phoneKey = "phone";
const firstNameKey = "first_name";
const lastNameKey = "last_name";
const emailKey = "email";
const birthDateKey = "birth_date";
const preferredNameKey = "preferred_name";
const countryKey = "country";
const recipientSinceKey = "si_start_date";
const termsAcceptedKey = "terms_accepted";
const transactionsKey = "transactions";
const nextSurveyKey = "next_survey";
const userIdKey = "user_id";
const imLinkInitialKey = "im_link_initial";
const imLinkRegularKey = "im_link_regular";

class UserDto {
  final String? userId;
  final String? phone;
  final String? orangePhone;
  final String? firstName;
  final String? lastName;
  final DateTime? birthDate;
  final String? email;
  final String? country;
  final String? preferredName;
  final DateTime? nextSurvey;
  final String? imLinkInitial;
  final String? imLinkRegular;
  bool? termsAccepted;

  UserDto({
    this.userId,
    this.firstName,
    this.lastName,
    this.preferredName,
    this.phone,
    this.orangePhone,
    this.email,
    this.birthDate,
    this.country,
    this.nextSurvey,
    this.imLinkInitial,
    this.imLinkRegular,
    this.termsAccepted,
  });

  UserAccount toUserAccount() {
    return UserAccount(
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      preferredName: preferredName ?? "",
      birthDate: birthDate,
      email: email ?? "",
      phone: phone ?? "",
      orangePhone: orangePhone ?? "",
      recipientSince: null,
      country: country ?? "",
    );
  }
}

extension UserDtoMapping on DocumentSnapshot<Object?> {
  UserDto mapUserDto() {
    return UserDto(
      firstName: _safeAssignString(this, firstNameKey),
      lastName: _safeAssignString(this, lastNameKey),
      preferredName: _safeAssignString(this, preferredNameKey),
      phone: _safeAssignPhone(this, communicationPhoneKey),
      orangePhone: _safeAssignPhone(this, moneyPhoneKey),
      email: _safeAssignString(this, emailKey),
      country: "Sierra Leone",
      birthDate: _safeAssignDate(this, birthDateKey),
      nextSurvey: _safeAssignDate(this, nextSurveyKey),
      termsAccepted: _safeAssignBool(this, termsAcceptedKey),
      imLinkInitial: _safeAssignString(this, imLinkInitialKey),
      imLinkRegular: _safeAssignString(this, imLinkRegularKey),
    );
  }

  String _safeAssignString(
    DocumentSnapshot snapshot,
    String key, {
    String replacementValue = "",
  }) {
    return _containsKey(snapshot, key)
        ? snapshot[key].toString()
        : replacementValue;
  }

  String _safeAssignPhone(DocumentSnapshot snapshot, String key) {
    return _containsKey(snapshot, key) ? "+${snapshot["$key.$phoneKey"]}" : "";
  }

  DateTime? _safeAssignDate(
    DocumentSnapshot snapshot,
    String key, {
    DateTime? replacementValue,
  }) {
    return _containsKey(snapshot, key)
        ? (snapshot[key] as Timestamp?)?.toDate()
        : replacementValue;
  }

  bool _safeAssignBool(DocumentSnapshot snapshot, String key) =>
      // ignore: avoid_bool_literals_in_conditional_expressions
      _containsKey(snapshot, key) ? snapshot[key] as bool : false;

  bool _containsKey(DocumentSnapshot snapshot, String key) {
    if (snapshot.data() == null) return false;

    return (snapshot.data()! as Map<String, dynamic>).containsKey(key);
  }
}
