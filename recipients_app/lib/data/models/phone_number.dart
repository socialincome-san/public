import "package:dart_mappable/dart_mappable.dart";

part "phone_number.mapper.dart";

/*
// A user can have multiple phone numbers, but only one primary number (constraint needed at application level)
model PhoneNumber {
  id        String         @id @default(cuid()) @map("id")
  userId    String         @map("user_id")
  phone     String         @map("phone")
  type      String         @map("type")
  verified  Boolean        @default(false) @map("verified")
  whatsApp  WhatsAppStatus @default(disabled) @map("whats_app")
  isPrimary Boolean        @default(false) @map("is_primary")
  createdAt DateTime       @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime       @updatedAt @map("updated_at") @db.Timestamptz(3)
  user      User           @relation(fields: [userId], references: [id])

  // Ensure a user cannot have duplicate phone numbers
  @@unique([userId, phone])
  @@map("phone_number")
}
*/
@MappableClass()
class PhoneNumber with PhoneNumberMappable {
  final String id;
  final String userId;
  final String phone;
  final String type;

  final bool isPrimary;
  // final bool verified;
  // final WhatsAppStatus whatsApp;
  // final User user;

  const PhoneNumber({
    required this.id,
    required this.userId,
    required this.phone,
    required this.type,
    required this.isPrimary,
    // required this.verified,
    // required this.whatsApp,
    // required this.user,
  });
}

// OLD
/* import "package:dart_mappable/dart_mappable.dart";

part "phone.mapper.dart";

@MappableClass()
class Phone with PhoneMappable {
  // @JsonKey(name: "phone", defaultValue: 0)
  final int phoneNumber;

  const Phone(this.phoneNumber);
}
 */
