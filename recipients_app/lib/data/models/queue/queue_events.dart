/// Base class for queue events
abstract class QueueEvent {
  final String operationType;

  const QueueEvent({required this.operationType});
}

/// Event emitted when an operation completes successfully
class QueueSuccessEvent extends QueueEvent {
  final String message;

  const QueueSuccessEvent({
    required super.operationType,
    required this.message,
  });
}

/// Event emitted when an operation fails
class QueueErrorEvent extends QueueEvent {
  final String message;
  final dynamic error;

  const QueueErrorEvent({
    required super.operationType,
    required this.message,
    required this.error,
  });
}
