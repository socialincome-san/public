import "package:app/data/models/queue/queue_operations.dart";
import "package:app/data/repositories/payment_repository.dart";
import "package:app/data/services/update_queue_service.dart";

/// Wrapper for PaymentRepository that queues update operations
class QueueAwarePaymentRepository extends PaymentRepository {
  final UpdateQueueService _queueService;

  QueueAwarePaymentRepository({
    required super.remoteDataSource,
    required super.demoDataSource,
    required super.localDataSource,
    required super.demoManager,
    required UpdateQueueService queueService,
  }) : _queueService = queueService;

  // Update operations are queued instead of executed directly
  @override
  Future<void> confirmPayment({required String payoutId}) async {
    await _queueService.enqueue(ConfirmPaymentOperation(payoutId: payoutId));
  }

  @override
  Future<void> contestPayment({
    required String payoutId,
    required String contestReason,
  }) async {
    await _queueService.enqueue(ContestPaymentOperation(
      payoutId: payoutId,
      contestReason: contestReason,
    ));
  }

  // All other methods (fetchPayouts, clearCache) inherited from PaymentRepository
}
