import "package:app/data/model/contact.dart";
import "package:app/data/model/local_partner.dart";
import "package:app/data/model/payment_information.dart";
import "package:app/data/model/program.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient.mapper.dart";

@MappableClass()
class Recipient with RecipientMappable {
  final String id;
  final String contactId;
  final String status;
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
