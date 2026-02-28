import "package:app/data/models/api/recipient_self_update.dart";
import "package:app/data/models/queue/queue_operations.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/user_repository.dart";
import "package:app/data/services/update_queue_service.dart";

/// Wrapper for UserRepository that queues update operations
class QueueAwareUserRepository extends UserRepository {
  final UpdateQueueService _queueService;

  QueueAwareUserRepository({
    required super.remoteDataSource,
    required super.demoDataSource,
    required super.localDataSource,
    required super.demoManager,
    required UpdateQueueService queueService,
  }) : _queueService = queueService;

  // Update operation is queued instead of executed directly
  @override
  Future<Recipient> updateRecipient(RecipientSelfUpdate selfUpdate) async {
    await _queueService.enqueue(UpdateRecipientOperation(selfUpdate: selfUpdate));

    // Return current recipient (optimistic - actual update happens via queue)
    // The queue will trigger a refresh when the update succeeds
    return currentRecipient!;
  }

  // All other methods (fetchRecipient, fetchCachedRecipient, clearCache) inherited from UserRepository
}
