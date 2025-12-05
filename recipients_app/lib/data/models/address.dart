import "package:app/data/models/user.dart";
import "package:dart_mappable/dart_mappable.dart";

part "address.mapper.dart";

/*
model Address {
  id        String   @id @default(cuid()) @map("id")
  street    String   @map("street")
  number    String   @map("number")
  city      String   @map("city")
  zip       Int      @map("zip")
  country   String   @map("country")
  userId    String   @unique @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@map("address")
}
*/
@MappableClass()
class Address with AddressMappable {
  final String id;
  final String userId;
  final String street;
  final String number;
  final String city;
  final int zip;
  final String country;
  final User user;

  const Address({
    required this.id,
    required this.userId,
    required this.street,
    required this.number,
    required this.city,
    required this.zip,
    required this.country,
    required this.user,
  });
}
