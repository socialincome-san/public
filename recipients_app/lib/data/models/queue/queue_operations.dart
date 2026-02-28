import "package:app/data/models/api/recipient_self_update.dart";
import "package:dart_mappable/dart_mappable.dart";

part "queue_operations.mapper.dart";

/// Enum for operation types in the queue
enum QueueOperationType {
  confirmPayment("confirm_payment"),
  contestPayment("contest_payment"),
  updateRecipient("update_recipient"),
  updatePaymentNumber("update_payment_number"),
  updateContactNumber("update_contact_number");

  final String value;
  const QueueOperationType(this.value);

  static QueueOperationType fromValue(String value) {
    return values.firstWhere((type) => type.value == value);
  }
}

/// Base class for queued operations
@MappableClass()
abstract class QueuedOperation with QueuedOperationMappable {
  final QueueOperationType type;

  const QueuedOperation({required this.type});
}

/// Operation to confirm a payment
@MappableClass()
class ConfirmPaymentOperation extends QueuedOperation with ConfirmPaymentOperationMappable {
  final String payoutId;

  const ConfirmPaymentOperation({required this.payoutId}) : super(type: QueueOperationType.confirmPayment);
}

/// Operation to contest a payment
@MappableClass()
class ContestPaymentOperation extends QueuedOperation with ContestPaymentOperationMappable {
  final String payoutId;
  final String contestReason;

  const ContestPaymentOperation({
    required this.payoutId,
    required this.contestReason,
  }) : super(type: QueueOperationType.contestPayment);
}

/// Operation to update recipient profile
@MappableClass()
class UpdateRecipientOperation extends QueuedOperation with UpdateRecipientOperationMappable {
  final RecipientSelfUpdate selfUpdate;

  const UpdateRecipientOperation({required this.selfUpdate}) : super(type: QueueOperationType.updateRecipient);
}

/// Operation to update payment number
@MappableClass()
class UpdatePaymentNumberOperation extends QueuedOperation with UpdatePaymentNumberOperationMappable {
  final String phoneNumber;

  const UpdatePaymentNumberOperation({required this.phoneNumber})
      : super(type: QueueOperationType.updatePaymentNumber);
}

/// Operation to update contact number
@MappableClass()
class UpdateContactNumberOperation extends QueuedOperation with UpdateContactNumberOperationMappable {
  final String phoneNumber;

  const UpdateContactNumberOperation({required this.phoneNumber})
      : super(type: QueueOperationType.updateContactNumber);
}
