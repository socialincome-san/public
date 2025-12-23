import "package:dart_mappable/dart_mappable.dart";

part "payment_files_import_result.mapper.dart";

@MappableClass()
class PaymentFilesImportResult with PaymentFilesImportResultMappable {
  final String id;

  final String contributionId;

  final String type;

  final String transactionId;

  final String? metadata;

  final String createdAt;
  final String? updatedAt;

  const PaymentFilesImportResult({
    required this.id,
    required this.contributionId,
    required this.type,
    required this.transactionId,
    this.metadata,
    required this.createdAt,
    this.updatedAt,
  });
}
