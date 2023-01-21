import "package:equatable/equatable.dart";
import "package:firebase_auth/firebase_auth.dart";

class SocialIncomeUser extends Equatable {
  final String userId;
  final String phoneNumber;
  final String? orangePhoneNumber;
  final String? firstName;
  final String? lastName;
  final DateTime? birthDate;
  final String? email;
  final String? country;
  final String? preferredName;

  final bool? termsAccepted;
  final DateTime? recipientSince;

  const SocialIncomeUser({
    required this.userId,
    required this.phoneNumber,
    this.orangePhoneNumber,
    this.firstName,
    this.lastName,
    this.birthDate,
    this.email,
    this.country,
    this.preferredName,
    this.termsAccepted,
    this.recipientSince,
  });

  @override
  List<Object?> get props {
    return [
      userId,
      phoneNumber,
      orangePhoneNumber,
      firstName,
      lastName,
      birthDate,
      email,
      country,
      preferredName,
      termsAccepted,
      recipientSince,
    ];
  }

  SocialIncomeUser copyWith({
    String? userId,
    String? phoneNumber,
    String? orangePhoneNumber,
    String? firstName,
    String? lastName,
    DateTime? birthDate,
    String? email,
    String? country,
    String? preferredName,
    bool? termsAccepted,
    DateTime? recipientSince,
  }) {
    return SocialIncomeUser(
      userId: userId ?? this.userId,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      orangePhoneNumber: orangePhoneNumber ?? this.orangePhoneNumber,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      birthDate: birthDate ?? this.birthDate,
      email: email ?? this.email,
      country: country ?? this.country,
      preferredName: preferredName ?? this.preferredName,
      termsAccepted: termsAccepted ?? this.termsAccepted,
      recipientSince: recipientSince ?? this.recipientSince,
    );
  }

  factory SocialIncomeUser.fromFirebaseUser(User user) {
    return SocialIncomeUser(
      userId: user.uid,
      phoneNumber: user.phoneNumber ?? "",
    );
  }

  factory SocialIncomeUser.fromMap(Map<String, dynamic> map) {
    return SocialIncomeUser(
      userId: map["userId"] as String,
      phoneNumber: map["phoneNumber"] as String,
      orangePhoneNumber: map["orangePhoneNumber"] as String?,
      firstName: map["firstName"] as String?,
      lastName: map["lastName"] as String?,
      birthDate: map["birthDate"] != null
          ? DateTime.fromMillisecondsSinceEpoch(map["birthDate"] as int)
          : null,
      email: map["email"] as String?,
      country: map["country"] as String?,
      preferredName: map["preferredName"] as String?,
      termsAccepted:
          // ignore: avoid_bool_literals_in_conditional_expressions
          map["termsAccepted"] != null ? map["termsAccepted"] as bool : false,
      recipientSince: map["recipientSince"] != null
          ? DateTime.fromMillisecondsSinceEpoch(map["recipientSince"] as int)
          : null,
    );
  }
}
