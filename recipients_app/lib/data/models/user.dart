import "package:app/data/models/address.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/gender.dart";
import "package:app/data/models/language_code.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/phone_number.dart";
import "package:app/data/models/recipient.dart";
import "package:dart_mappable/dart_mappable.dart";

part "user.mapper.dart";

/*
model User {
  id          String        @id @default(cuid()) @map("id")
  email       String        @unique @map("email")
  authUserId  String?       @unique @map("auth_user_id")
  firstName   String        @map("first_name")
  lastName    String        @map("last_name")
  gender      Gender        @default(private) @map("gender")
  language    LanguageCode? @map("language")
  currency    Currency?     @map("currency")
  dateOfBirth DateTime?     @map("date_of_birth") @db.Date
  Contributor Contributor?
  Recipient   Recipient?
  PortalUser  PortalUser?

  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime? @updatedAt @map("updated_at") @db.Timestamptz(3)

  Address       Address[]
  LocalPartner  LocalPartner?
  PhoneNumber   PhoneNumber[]
  ProgramAccess ProgramAccess[]

  @@map("user")
}
*/
@MappableClass()
class User with UserMappable {
  final String id;
  final String email;
  final String? authUserId;

  final String firstName;
  final String lastName;
  final Gender gender;
  final LanguageCode? languageCode;
  final Currency? currency;
  final DateTime? dateOfBirth;
  // final Contributor? contributor;
  final Recipient? recipient;

  final List<Address> address;
  final LocalPartner? localPartner;
  final List<PhoneNumber> phoneNumber;

  const User({
    required this.id,
    required this.email,
    required this.authUserId,
    required this.firstName,
    required this.lastName,
    required this.gender,
    required this.languageCode,
    required this.currency,
    required this.dateOfBirth,
    required this.recipient,
    required this.address,
    required this.localPartner,
    required this.phoneNumber,
  });
  // final List<ProgramAccess> programAccess;
}
