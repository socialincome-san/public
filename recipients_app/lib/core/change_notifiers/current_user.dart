import "package:app/data/models/social_income_transaction.dart";
import "package:app/services/database_service.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:collection/collection.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

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

class CurrentUser extends ChangeNotifier {
  String? userId;
  String? phoneNumber;
  String? orangePhoneNumber;
  String? firstName;
  String? lastName;
  DateTime? birthDate;
  String? email;
  String? country;
  String? preferredName;
  bool? termsAccepted;
  List<SocialIncomeTransaction>? transactions; // List<Map<String, dynamic>>
  bool? stateToggle; // for convenient usage to update deep nested object
  Timestamp? recipientSince;
  DateTime? nextSurvey;
  String? imLinkInitial;
  String? imLinkRegular;

  CurrentUser({
    this.phoneNumber,
    this.orangePhoneNumber,
    this.userId,
    this.firstName,
    this.lastName,
    this.preferredName,
    this.termsAccepted,
    this.birthDate,
    this.email,
    this.country,
    this.transactions,
    this.recipientSince,
    this.nextSurvey,
    this.imLinkInitial,
    this.imLinkRegular,
  }) {
    transactions ??= [];
  }

  DatabaseService databaseService = DatabaseService();

  Map<String, dynamic> data() => {
        userIdKey: userId,
        "$communicationPhoneKey.$phoneKey":
            int.tryParse(phoneNumber?.substring(1) ?? ""),
        "$moneyPhoneKey.$phoneKey":
            int.tryParse(orangePhoneNumber?.substring(1) ?? ""),
        emailKey: email,
        birthDateKey: birthDate,
        firstNameKey: firstName,
        lastNameKey: lastName,
        preferredNameKey: preferredName,
        countryKey: country,
        recipientSinceKey: recipientSince,
        termsAcceptedKey: termsAccepted,
        transactionsKey:
            transactions?.map((transaction) => transaction.data()).toList(),
        nextSurveyKey: nextSurvey,
        imLinkInitialKey: imLinkInitial,
        imLinkRegularKey: imLinkRegular
      };

  String? changeableInformation(String section) {
    switch (section) {
      case "First Name":
        return firstName;
      case "Last Name":
        return lastName;
      case "Preferred Name":
        return preferredName;
      case "Email":
        return email;
      case "Phone Number":
        return phoneNumber;
      case "Date of Birth":
        final birthDate = this.birthDate;
        return birthDate != null
            ? DateFormat("dd.MM.yyyy").format(birthDate)
            : "";
      default:
        return "";
    }
  }

  String safeAssignPhone(DocumentSnapshot snapshot, String key) {
    return containsKey(snapshot, key) ? "+${snapshot["$key.$phoneKey"]}" : "";
  }

  String safeAssignString(
    DocumentSnapshot snapshot,
    String key, {
    String replacementValue = "",
  }) {
    return containsKey(snapshot, key)
        ? snapshot[key].toString()
        : replacementValue;
  }

  DateTime? safeAssignDate(
    DocumentSnapshot snapshot,
    String key, {
    DateTime? replacementValue,
  }) {
    return containsKey(snapshot, key)
        ? (snapshot[key] as Timestamp?)?.toDate()
        : replacementValue;
  }

  Timestamp? safeAssignTime(
    DocumentSnapshot snapshot,
    String key, {
    DateTime? replacementValue,
  }) {
    return containsKey(snapshot, key)
        ? snapshot[key] as Timestamp?
        : (replacementValue != null
            ? Timestamp.fromDate(replacementValue)
            : null);
  }

  bool safeAssignBool(DocumentSnapshot snapshot, String key) =>
      // ignore: avoid_bool_literals_in_conditional_expressions
      containsKey(snapshot, key) ? snapshot[key] as bool : false;

  bool containsKey(DocumentSnapshot snapshot, String key) {
    if (snapshot.data() == null) return false;

    return (snapshot.data()! as Map<String, dynamic>).containsKey(key);
  }

  Future<void> initialize(DocumentSnapshot doc) async {
    userId = doc.id;
    phoneNumber = safeAssignPhone(doc, communicationPhoneKey);
    orangePhoneNumber = safeAssignPhone(doc, moneyPhoneKey);
    firstName = safeAssignString(doc, firstNameKey);
    lastName = safeAssignString(doc, lastNameKey);
    email = safeAssignString(doc, emailKey);
    country = "Sierra Leone"; // to be dynamically assigned later
    birthDate = safeAssignDate(doc, birthDateKey);
    preferredName = safeAssignString(doc, preferredNameKey);
    recipientSince = safeAssignTime(doc, recipientSinceKey);
    termsAccepted = safeAssignBool(doc, termsAcceptedKey);

    nextSurvey = safeAssignDate(
      doc,
      nextSurveyKey,
      replacementValue:
          FirebaseAuth.instance.currentUser?.metadata.creationTime,
    );
    transactions = await databaseService
        .fetchTransactionDetails(); // need this so that History Card is updated after sign out
    imLinkInitial = safeAssignString(doc, imLinkInitialKey);
    imLinkRegular = safeAssignString(doc, imLinkRegularKey);
    notifyListeners();
  }

  Map<String, String> sectionMap() {
    return {
      "First Name": firstNameKey,
      "Last Name": lastNameKey,
      "Preferred Name": preferredNameKey,
      "Date of Birth": birthDateKey,
      "Email": emailKey,
      "Phone Number": "$communicationPhoneKey.$phoneKey"
    };
  }

  void updateBasicInfo(String section, String value) {
    switch (section) {
      case "First Name":
        firstName = value;
        break;
      case "Last Name":
        lastName = value;
        break;
      case "Preferred Name":
        preferredName = value;
        break;
      case "Email":
        email = value;
        break;
      case "Phone Number":
        phoneNumber = value;
        break;
    }
    final sectionKey = sectionMap()[section];
    if (sectionKey == null) {
      return;
    }

    final Map<String, String> map = {sectionKey: value};
    databaseService.updateUser(map);
    notifyListeners();
  }

  void updateBirthday(DateTime birthday) {
    birthDate = birthday;
    final Map<String, Object> updateMap = {
      birthDateKey: Timestamp.fromDate(birthday)
    };
    databaseService.updateUser(updateMap);
    notifyListeners();
  }

  void acceptTerms() {
    termsAccepted = true;
    databaseService.updateUser(data());
    notifyListeners();
  }

  Future<void> confirmTransaction(String transactionId) async {
    final currentTransaction = transactions
        ?.firstWhereOrNull((element) => element.id == transactionId);

    if (currentTransaction == null) {
      return;
    }

    currentTransaction.status = "confirmed";
    currentTransaction.confirmedAt = Timestamp.fromDate(DateTime.now());
    final Map<String, Object> info = {
      "status": "confirmed",
      "confirm_at": DateTime.now()
    };
    databaseService.updateTransaction(info, transactionId);
  }

  void contestTransaction(String transactionId, String contestReason) {
    final currentTransaction = transactions
        ?.firstWhereOrNull((element) => element.id == transactionId);

    if (currentTransaction == null) {
      return;
    }

    currentTransaction.status = "contested";
    currentTransaction.contestedAt = Timestamp.fromDate(DateTime.now());
    final Map<String, Object> info = {
      "status": "contested",
      "contested_at": DateTime.now(),
      "contest_reason": contestReason,
    };
    databaseService.updateTransaction(info, transactionId);
  }

  int totalIncome() {
    int sum = 0;
    for (final SocialIncomeTransaction element
        in transactions ?? List.empty()) {
      final amount = element.amount;
      if (element.status != "confirmed" || amount == null) continue;

      final int factor = (element.currency == "SLL") ? 1000 : 1;
      sum += (amount / factor).floor();
    }

    return sum;
  }

  String? surveyUrl() {
    final DateTime? nextSurveyDate = nextSurvey;
    final DateTime? creationDate =
        FirebaseAuth.instance.currentUser?.metadata.creationTime;

    if (nextSurveyDate == null || DateTime.now().isBefore(nextSurveyDate)) {
      return null;
    }

    if (nextSurveyDate.month == creationDate?.month) {
      return imLinkInitial;
    }

    return imLinkRegular;
  }

  void setNextSurvey() {
    DateTime previousDate;

    final DateTime? currentNextSurvey = nextSurvey;
    if (currentNextSurvey == null) {
      previousDate = FirebaseAuth.instance.currentUser?.metadata.creationTime ??
          DateTime.now();
    } else {
      previousDate = currentNextSurvey;
    }

    DateTime resultNextSurvey;
    if (previousDate.month > 6) {
      resultNextSurvey =
          DateTime(previousDate.year + 1, previousDate.month - 6);
    } else {
      resultNextSurvey = DateTime(previousDate.year, previousDate.month + 6);
    }
    nextSurvey = resultNextSurvey;
    databaseService.updateNextSurvey(resultNextSurvey);
    notifyListeners();
  }
}
