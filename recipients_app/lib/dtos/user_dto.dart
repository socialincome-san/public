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

  UserDto({
    this.userId,
    this.phone,
    this.orangePhone,
    this.firstName,
    this.lastName,
    this.birthDate,
    this.email,
    this.country,
    this.preferredName,
    this.nextSurvey,
    this.imLinkInitial,
    this.imLinkRegular,
  });

  UserAccount toUser() {
    return UserAccount(
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      preferredName: preferredName ?? "",
      birthDate: birthDate,
      email: email ?? "",
      phone: phone ?? "",
      recipientSince: null,
      totalIncome: 0,
      country: country ?? "",
      orangePhone: orangePhone ?? "",
    );
  }
}

extension UserDtoMapping on DocumentSnapshot<Object?> {
  UserDto mapUserDto() {
    return UserDto(
      firstName: _safeAssignString(this, firstNameKey),
      lastName: _safeAssignString(this, lastNameKey),
      email: _safeAssignString(this, emailKey),
      country: "Sierra Leone",
      preferredName: _safeAssignString(this, preferredNameKey),
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

  bool _containsKey(DocumentSnapshot snapshot, String key) {
    if (snapshot.data() == null) return false;

    return (snapshot.data()! as Map<String, dynamic>).containsKey(key);
  }
}
