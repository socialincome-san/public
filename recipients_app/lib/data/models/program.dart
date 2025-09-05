import "package:app/data/models/currency.dart";
import "package:app/data/models/organization.dart";
import "package:app/data/models/payout_interval.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/models/survey/survey.dart";
import "package:dart_mappable/dart_mappable.dart";

part "program.mapper.dart";

/*
model Program {
  id                     String          @id @default(cuid()) @map("id")
  name                   String          @unique @map("name")
  totalPayments          Int             @map("total_payments")
  payoutAmount           Float           @map("payout_amount")
  payoutCurrency         Currency        @default(SLE) @map("payout_currency")
  payoutInterval         PayoutInterval  @default(monthly) @map("payout_interval")
  country                String          @default("Sierra Leone") @map("country")
  viewerOrganizationId   String          @map("viewer_organization_id")
  operatorOrganizationId String          @map("operator_organization_id")
  owner                  Organization    @relation("ProgramViewers", fields: [viewerOrganizationId], references: [id])
  operator               Organization    @relation("ProgramOperators", fields: [operatorOrganizationId], references: [id])
  campaigns              Campaign[]
  recipients             Recipient[]
  contributions          Contribution[]
  surveys                Survey[]
  createdAt              DateTime        @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt              DateTime?       @updatedAt @map("updated_at") @db.Timestamptz(3)
  ProgramAccess          ProgramAccess[]

  @@map("program")
}

*/
@MappableClass()
class Program with ProgramMappable {
  final String id;
  final String name;
  final int totalPayments;
  final double payoutAmount;
  final Currency payoutCurrency;
  final PayoutInterval payoutInterval;
  final String country;
  final String viewerOrganizationId;
  final String operatorOrganizationId;
  final Organization owner;
  final Organization operator;
  // final List<Campaign> campaigns;
  final List<Recipient> recipients;
  // final List<Contribution> contributions;
  final List<Survey> surveys;
  final DateTime createdAt;
  final DateTime? updatedAt;
  // final List<ProgramAccess> programAccess;

  const Program({
    required this.id,
    required this.name,
    required this.totalPayments,
    required this.payoutAmount,
    required this.payoutCurrency,
    required this.payoutInterval,
    required this.country,
    required this.viewerOrganizationId,
    required this.operatorOrganizationId,
    required this.owner,
    required this.operator,
    // required this.campaigns,
    required this.recipients,
    // required this.contributions,
    required this.surveys,
    required this.createdAt,
    required this.updatedAt,
    // required this.programAccess,
  });
}
