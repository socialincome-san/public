import "dart:async";

import "package:app/core/cubits/connectivity/connectivity_cubit.dart";
import "package:app/data/database/app_database.dart";
import "package:app/data/models/queue/queue_events.dart";
import "package:app/data/models/queue/queue_operations.dart";
import "package:app/data/repositories/repositories.dart";
import "package:drift/drift.dart";

const int _kMaxRetries = 3;

class UpdateQueueService {
  final AppDatabase database;
  final ConnectivityCubit connectivityCubit;
  final PaymentRepository paymentRepository;
  final UserRepository userRepository;
  final CrashReportingRepository crashReportingRepository;

  // Event stream for UI notifications
  final StreamController<QueueEvent> _eventController = StreamController.broadcast();
  Stream<QueueEvent> get events => _eventController.stream;

  // Stream for queue count updates (for badge)
  final StreamController<int> _countController = StreamController.broadcast();
  Stream<int> get pendingCountStream => _countController.stream;

  // Processing state
  bool _isProcessing = false;
  StreamSubscription? _connectivitySubscription;

  UpdateQueueService({
    required this.database,
    required this.connectivityCubit,
    required this.paymentRepository,
    required this.userRepository,
    required this.crashReportingRepository,
  }) {
    _listenToConnectivity();
  }

  // Listen to connectivity changes and auto-resume processing
  void _listenToConnectivity() {
    _connectivitySubscription = connectivityCubit.stream.listen((state) {
      if (state.isOnline && !_isProcessing) {
        processQueue();
      }
    });
  }

  // Add operation to queue
  Future<void> enqueue(QueuedOperation operation) async {
    // Insert into database
    await database.into(database.updateQueue).insert(
          UpdateQueueCompanion.insert(
            operationType: operation.type.value,
            operationPayload: operation.toJson(),
            createdAt: DateTime.now(),
          ),
        );

    // Update pending count
    await _emitPendingCount();

    // Start processing if online
    if (connectivityCubit.state.isOnline) {
      processQueue();
    }
  }

  // Process all pending operations sequentially
  Future<void> processQueue() async {
    if (_isProcessing) return;
    if (!connectivityCubit.state.isOnline) return;

    _isProcessing = true;

    try {
      while (true) {
        // Get next pending operation
        final operation = await _getNextOperation();
        if (operation == null) break;

        // Mark as processing
        await _updateOperationStatus(operation.id, "processing");

        try {
          // Execute the operation
          await _executeOperation(operation);

          // Success - remove from queue
          await _removeOperation(operation.id);

          // Emit success event for UI notification
          _eventController.add(QueueSuccessEvent(
            operationType: operation.operationType,
            message: _getSuccessMessage(operation.operationType),
          ));

          // Update pending count
          await _emitPendingCount();
        } catch (e) {
          // Operation failed
          await _handleOperationFailure(operation, e);
        }
      }
    } finally {
      _isProcessing = false;
    }
  }

  // Execute operation based on type
  Future<void> _executeOperation(UpdateQueueData operation) async {
    final type = QueueOperationType.fromValue(operation.operationType);

    switch (type) {
      case QueueOperationType.confirmPayment:
        final op = ConfirmPaymentOperationMapper.fromJson(operation.operationPayload);
        await paymentRepository.confirmPayment(payoutId: op.payoutId);

      case QueueOperationType.contestPayment:
        final op = ContestPaymentOperationMapper.fromJson(operation.operationPayload);
        await paymentRepository.contestPayment(
          payoutId: op.payoutId,
          contestReason: op.contestReason,
        );

      case QueueOperationType.updateRecipient:
        final op = UpdateRecipientOperationMapper.fromJson(operation.operationPayload);
        await userRepository.updateRecipient(op.selfUpdate);

      case QueueOperationType.updatePaymentNumber:
        // final op = UpdatePaymentNumberOperationMapper.fromJson(operation.operationPayload);
        // TODO: Implement when dashboard repository is created
        throw UnimplementedError("updatePaymentNumber not yet implemented in queue");

      case QueueOperationType.updateContactNumber:
        // final op = UpdateContactNumberOperationMapper.fromJson(operation.operationPayload);
        // TODO: Implement when dashboard repository is created
        throw UnimplementedError("updateContactNumber not yet implemented in queue");
    }
  }

  // Error handling with retry logic
  Future<void> _handleOperationFailure(UpdateQueueData operation, dynamic error) async {
    final newRetryCount = operation.retryCount + 1;

    if (newRetryCount >= _kMaxRetries) {
      // Max retries exceeded - mark as failed and emit error event
      await (database.update(database.updateQueue)..where((tbl) => tbl.id.equals(operation.id))).write(
        UpdateQueueCompanion(
          status: const Value("failed"),
          retryCount: Value(newRetryCount),
          error: Value(error.toString()),
        ),
      );

      _eventController.add(QueueErrorEvent(
        operationType: operation.operationType,
        message: "Operation failed after $_kMaxRetries attempts",
        error: error,
      ));

      // Update pending count (failed operations don't count as pending)
      await _emitPendingCount();
    } else {
      // Mark as pending for retry
      await (database.update(database.updateQueue)..where((tbl) => tbl.id.equals(operation.id))).write(
        UpdateQueueCompanion(
          status: const Value("pending"),
          retryCount: Value(newRetryCount),
          error: Value(error.toString()),
        ),
      );
    }

    crashReportingRepository.logError(error as Exception, StackTrace.current);
  }

  Future<UpdateQueueData?> _getNextOperation() async {
    return await (database.select(database.updateQueue)
          ..where((tbl) => tbl.status.equals("pending"))
          ..orderBy([(tbl) => OrderingTerm.asc(tbl.createdAt)])
          ..limit(1))
        .getSingleOrNull();
  }

  Future<void> _updateOperationStatus(int id, String status) async {
    await (database.update(database.updateQueue)..where((tbl) => tbl.id.equals(id))).write(
      UpdateQueueCompanion(
        status: Value(status),
      ),
    );
  }

  Future<void> _removeOperation(int id) async {
    await (database.delete(database.updateQueue)..where((tbl) => tbl.id.equals(id))).go();
  }

  String _getSuccessMessage(String operationType) {
    return switch (operationType) {
      "confirm_payment" => "Payment confirmed successfully",
      "contest_payment" => "Payment contested successfully",
      "update_recipient" => "Profile updated successfully",
      "update_payment_number" => "Payment number updated successfully",
      "update_contact_number" => "Contact number updated successfully",
      _ => "Operation completed successfully",
    };
  }

  // Get pending queue count for UI badge
  Future<int> getPendingCount() async {
    final result = await (database.select(database.updateQueue)..where((tbl) => tbl.status.equals("pending")))
        .get();
    return result.length;
  }

  // Emit pending count to stream
  Future<void> _emitPendingCount() async {
    final count = await getPendingCount();
    _countController.add(count);
  }

  // Get all operations for debug UI
  Future<List<UpdateQueueData>> getAllOperations() async {
    return await (database.select(database.updateQueue)..orderBy([(tbl) => OrderingTerm.desc(tbl.createdAt)]))
        .get();
  }

  void dispose() {
    _connectivitySubscription?.cancel();
    _eventController.close();
    _countController.close();
  }
}
