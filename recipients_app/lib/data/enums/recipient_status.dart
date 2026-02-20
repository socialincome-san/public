import "package:dart_mappable/dart_mappable.dart";

part "recipient_status.mapper.dart";

@MappableEnum()
enum RecipientStatus {
  active,
  suspended,
  waitlisted,
  designated,
  former,
}
