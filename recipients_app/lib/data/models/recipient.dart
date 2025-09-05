import "package:app/data/models/local_partner.dart";
import "package:app/data/models/payout.dart";
import "package:app/data/models/phone_number.dart";
import "package:app/data/models/program.dart";
import "package:app/data/models/recipient_status.dart";
import "package:app/data/models/survey/survey.dart";
import "package:app/data/models/user.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient.mapper.dart";

/*
{
    "ok": true,
    "data": {
        "id": "cmes7ku1z0005xqmfsg2re8wr",
        "userId": "cmes7ktsf0003xqmfhwg7fkt0",
        "programId": "cmes7ktjf0001xqmf6lrszkqe",
        "localPartnerId": "cmes7ks6r000nxqlmtpwo7u2x",
        "startDate": "2025-06-14T22:00:00.000Z",
        "status": "active",
        "createdAt": "2025-08-26T07:12:25.128Z",
        "updatedAt": "2025-08-26T07:12:25.128Z",
        "user": {
            "id": "cmes7ktsf0003xqmfhwg7fkt0",
            "email": "karinbtest@autocreated.socialincome",
            "authUserId": null,
            "firstName": "Karin B.",
            "lastName": "Test",
            "gender": "female",
            "phone": null,
            "company": null,
            "referral": null,
            "paymentReferenceId": null,
            "stripeCustomerId": null,
            "institution": false,
            "language": "kri",
            "currency": null,
            "addressStreet": null,
            "addressNumber": null,
            "addressCity": null,
            "addressZip": null,
            "addressCountry": null,
            "role": "user",
            "organizationId": "cmes7kjhr0000xqkpracprwhv",
            "birthDate": null,
            "communicationPhone": "491737910926",
            "mobileMoneyPhone": "491737910926",
            "hasWhatsAppComm": null,
            "hasWhatsAppMobile": null,
            "whatsappActivated": null,
            "instaHandle": null,
            "twitterHandle": null,
            "profession": null,
            "callingName": "Kay",
            "omUid": 10001,
            "createdAt": "2025-08-26T07:12:24.783Z",
            "updatedAt": "2025-08-26T07:12:24.783Z"
        },
        "program": {
            "id": "cmes7ktjf0001xqmf6lrszkqe",
            "name": "Genesis",
            "totalPayments": 36,
            "payoutAmount": 700,
            "payoutCurrency": "SLE",
            "payoutInterval": "monthly",
            "country": "Sierra Leone",
            "viewerOrganizationId": "cmes7kjhr0000xqkpracprwhv",
            "operatorOrganizationId": "cmes7kjhr0000xqkpracprwhv",
            "createdAt": "2025-08-26T07:12:24.459Z",
            "updatedAt": "2025-08-26T07:12:24.459Z"
        },
        "localPartner": {
            "id": "cmes7ks6r000nxqlmtpwo7u2x",
            "name": "Social Income",
            "userId": "cmes7ks53000lxqlmt0zqhfw5",
            "createdAt": "2025-08-26T07:12:22.707Z",
            "updatedAt": "2025-08-26T07:12:22.707Z",
            "user": {
                "id": "cmes7ks53000lxqlmt0zqhfw5",
                "email": "social-income@autocreated.socialincome",
                "authUserId": null,
                "firstName": "",
                "lastName": "",
                "gender": "private",
                "phone": null,
                "company": null,
                "referral": null,
                "paymentReferenceId": null,
                "stripeCustomerId": null,
                "institution": false,
                "language": "en",
                "currency": null,
                "addressStreet": null,
                "addressNumber": null,
                "addressCity": null,
                "addressZip": null,
                "addressCountry": null,
                "role": "user",
                "organizationId": null,
                "birthDate": null,
                "communicationPhone": null,
                "mobileMoneyPhone": null,
                "hasWhatsAppComm": null,
                "hasWhatsAppMobile": null,
                "whatsappActivated": null,
                "instaHandle": null,
                "twitterHandle": null,
                "profession": null,
                "callingName": null,
                "omUid": null,
                "createdAt": "2025-08-26T07:12:22.646Z",
                "updatedAt": "2025-08-26T07:12:22.646Z"
            }
        }
    }
}
*/
/*
model Recipient {
  id             String          @id @default(cuid()) @map("id")
  userId         String          @unique @map("user_id")
  programId      String          @map("program_id")
  localPartnerId String          @map("local_partner_id")
  localPartner   LocalPartner    @relation(fields: [localPartnerId], references: [id])
  startDate      DateTime?       @map("start_date") @db.Timestamptz(3)
  status         RecipientStatus @map("status")
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt      DateTime?       @updatedAt @map("updated_at") @db.Timestamptz(3)
  omUid          Int?            @map("om_uid")
  profession     String?         @map("profession")
  callingName    String?         @map("calling_name")
  program        Program         @relation(fields: [programId], references: [id])
  user           User            @relation(fields: [userId], references: [id])
  payouts        Payout[]
  surveys        Survey[]

  @@map("recipient")
}
*/
@MappableClass()
class Recipient with RecipientMappable {
  final String id;

  // final String userId;
  // final String programId;
  // final String localPartnerId;
  // final int? omUid;

  final User user;
  final LocalPartner localPartner;
  final Program program;

  final RecipientStatus status;

  final DateTime? startDate;
  final String? profession;
  final String? callingName;

  final List<Payout> payouts;
  final List<Survey> surveys;

  const Recipient({
    required this.id,
    required this.localPartner,
    required this.status,
    required this.program,
    required this.user,
    this.payouts = const [],
    this.surveys = const [],
    this.startDate,
    this.profession,
    this.callingName,
    // required this.userId,
    // required this.programId,
    // required this.localPartnerId,
    // required this.omUid,
  });

  PhoneNumber? get communicationMobilePhone => user.phoneNumber.firstWhere((phoneNumber) => !phoneNumber.isPrimary);
  PhoneNumber? get mobileMoneyPhone => user.phoneNumber.firstWhere((phoneNumber) => phoneNumber.isPrimary);

  String get userId => user.id;
}

// OLD
/* import "package:app/data/models/models.dart";
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
 */
