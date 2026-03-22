import "package:app/core/helpers/date_time_converter.dart";
import "package:app/data/models/contact.dart";
import "package:app/data/models/local_partner.dart";
import "package:app/data/models/payment_information.dart";
import "package:app/data/models/program.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient.mapper.dart";

@MappableClass()
class Recipient with RecipientMappable {
  final String id;
  @MappableField(hook: DateTimeHook())
  final DateTime? startDate;
  final String? successorName;
  final bool termsAccepted;
  final String contactId;
  final Contact contact;
  final String? paymentInformationId;
  final String programId;
  final String localPartnerId;
  final LocalPartner localPartner;
  final Program program;
  final PaymentInformation? paymentInformation;
  @MappableField(hook: DateTimeHook())
  final DateTime createdAt;
  @MappableField(hook: DateTimeHook())
  final DateTime? updatedAt;

  const Recipient({
    required this.id,
    required this.contactId,
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
