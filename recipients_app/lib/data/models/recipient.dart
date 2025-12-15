import "package:app/data/enums/recipient_status.dart";
import "package:app/data/models/contact.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/payment_information.dart";
import "package:app/data/models/program.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient.mapper.dart";

@MappableClass()
class Recipient with RecipientMappable {
  final String id;
  final String contactId;
  final RecipientStatus status;
  final String? startDate;
  final String? successorName;
  final bool termsAccepted;
  final String? paymentInformationId;
  final String programId;
  final String localPartnerId;
  final Contact contact;
  final Program program;
  final LocalPartner localPartner;
  final PaymentInformation? paymentInformation;

  final String createdAt;
  final String? updatedAt;

  const Recipient({
    required this.id,
    required this.contactId,
    required this.status,
    this.startDate,
    this.successorName,
    required this.termsAccepted,
    this.paymentInformationId,
    required this.programId,
    required this.localPartnerId,
    required this.contact,
    required this.program,
    required this.localPartner,
    this.paymentInformation,
    required this.createdAt,
    this.updatedAt,
  });
}
