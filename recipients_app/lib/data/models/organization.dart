import "package:app/data/model/program.dart";
import "package:dart_mappable/dart_mappable.dart";

part "organization.mapper.dart";

/*
model Organization {
  id               String         @id @default(cuid()) @map("id")
  name             String         @unique @map("name")
  operatedPrograms Program[]      @relation("ProgramOperators")
  viewedPrograms   Program[]      @relation("ProgramViewers")
  createdAt        DateTime       @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt        DateTime?      @updatedAt @map("updated_at") @db.Timestamptz(3)
  PortalAccess     PortalAccess[]

  @@map("organization")
}
*/
@MappableClass()
class Organization with OrganizationMappable {
  final String id;
  final String name;
  final List<Program> operatedPrograms;
  final List<Program> viewedPrograms;
  // final List<PortalAccess> portalAccess;

  const Organization({
    required this.id,
    required this.name,
    required this.operatedPrograms,
    required this.viewedPrograms,
    // required this.portalAccess,
  });
}

/* import "package:dart_mappable/dart_mappable.dart";

part "organization.mapper.dart";

@MappableClass()
class Organization with OrganizationMappable {
  final String name;
  final String? contactName;
  final String? contactNumber;

  const Organization({
    required this.name,
    this.contactName,
    this.contactNumber,
  });
}
 */
