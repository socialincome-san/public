import "package:app/data/models/currency.dart";
import "package:app/data/models/payout_status.dart";
import "package:app/data/models/recipient.dart";
import "package:dart_mappable/dart_mappable.dart";

part "payout.mapper.dart";

/*
model Payout {
  id          String       @id @default(cuid()) @map("id")
  amount      Float        @map("amount")
  amountChf   Float?       @map("amount_chf")
  currency    String       @map("currency")
  paymentAt   DateTime     @map("payment_at") @db.Timestamptz(3)
  status      PayoutStatus @map("status")
  phoneNumber String?      @map("phone_number")
  comments    String?      @map("comments")
  message     String?      @map("message")
  recipientId String       @map("recipient_id")
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime?    @updatedAt @map("updated_at") @db.Timestamptz(3)
  recipient   Recipient    @relation(fields: [recipientId], references: [id])

  @@map("payout")
}
*/
@MappableClass()
class Payout with PayoutMappable {
  final String id;
  final double amount;
  final double? amountChf;
  final Currency currency;
  final DateTime paymentAt;
  final PayoutStatus status;
  final String? phoneNumber;
  final String? comments;
  final String? message;
  final String recipientId;
  final Recipient recipient;

  const Payout({
    required this.id,
    required this.amount,
    required this.amountChf,
    required this.currency,
    required this.paymentAt,
    required this.status,
    required this.phoneNumber,
    required this.comments,
    required this.message,
    required this.recipientId,
    required this.recipient,
  });
}
