import "package:app/data/models/user.dart";
import "package:dart_mappable/dart_mappable.dart";

part "local_partner.mapper.dart";

/*
model LocalPartner {
  id          String        @id @default(cuid()) @map("id")
  name        String        @unique @map("name")
  userId      String        @unique @map("user_id")
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime?     @updatedAt @map("updated_at") @db.Timestamptz(3)
  user        User          @relation(fields: [userId], references: [id])
  recipients  Recipient[]
  Contributor Contributor[]

  @@map("local_partner")
}
*/
@MappableClass()
class LocalPartner with LocalPartnerMappable {
  final String id;
  final String name;
  final User user;

  // final List<Recipient> recipients;
  // final String userId;
  // final List<Contributor> contributors;

  const LocalPartner({
    required this.id,
    required this.name,
    required this.user,
    // required this.recipients,
    // required this.userId,
    // required this.contributors,
  });
}
