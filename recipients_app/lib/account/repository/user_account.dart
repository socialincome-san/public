import "package:equatable/equatable.dart";

class UserAccount extends Equatable {
  final String firstName;
  final String lastName;
  final String preferredName;
  final DateTime? birthDate;
  final String email;
  final String phone;
  final DateTime? recipientSince;
  final String country;
  final String orangePhone;

  const UserAccount({
    required this.firstName,
    required this.lastName,
    required this.preferredName,
    required this.birthDate,
    required this.email,
    required this.phone,
    required this.recipientSince,
    required this.country,
    required this.orangePhone,
  });

  @override
  List<Object?> get props => [
        firstName,
        lastName,
        preferredName,
        birthDate,
        email,
        phone,
        recipientSince,
        country,
        orangePhone
      ];
}
