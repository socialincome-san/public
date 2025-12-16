import "package:app/data/enums/gender.dart";
import "package:app/data/enums/payment_provider.dart";
import "package:app/data/models/language_code.dart";
import "package:dart_mappable/dart_mappable.dart";

part "recipient_self_update.mapper.dart";

@MappableClass()
class RecipientSelfUpdate with RecipientSelfUpdateMappable {
  final String? firstName;
  final String? lastName;
  final String? callingName;
  final Gender? gender;
  final String? dateOfBirth;
  final LanguageCode? language;
  final String? email;
  final String? contactPhone;
  final String? paymentPhone;
  final PaymentProvider? paymentProvider;
  final String? successorName;
  final bool? termsAccepted;

  const RecipientSelfUpdate({
    this.firstName,
    this.lastName,
    this.callingName,
    this.gender,
    this.dateOfBirth,
    this.language,
    this.email,
    this.contactPhone,
    this.paymentPhone,
    this.paymentProvider,
    this.successorName,
    this.termsAccepted,
  });
}
