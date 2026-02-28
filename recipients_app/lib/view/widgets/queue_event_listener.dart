import "dart:async";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/queue/queue_events.dart";
import "package:app/data/services/update_queue_service.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

/// Global listener for queue events that shows notifications and triggers data refresh
class QueueEventListener extends StatefulWidget {
  final UpdateQueueService queueService;
  final Widget child;

  const QueueEventListener({
    super.key,
    required this.queueService,
    required this.child,
  });

  @override
  State<QueueEventListener> createState() => _QueueEventListenerState();
}

class _QueueEventListenerState extends State<QueueEventListener> {
  StreamSubscription<QueueEvent>? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = widget.queueService.events.listen(_handleQueueEvent);
  }

  void _handleQueueEvent(QueueEvent event) {
    if (!mounted) return;

    if (event is QueueSuccessEvent) {
      FlushbarHelper.showFlushbar(
        context,
        message: event.message,
      );
      _refreshDataAfterSuccess(event.operationType);
    } else if (event is QueueErrorEvent) {
      FlushbarHelper.showFlushbar(
        context,
        message: event.message,
        type: FlushbarType.error,
      );
    }
  }

  void _refreshDataAfterSuccess(String operationType) {
    // Trigger appropriate cubit refresh based on operation type
    if (operationType.contains("payment")) {
      // Refresh payments after payment operations
      final payoutsCubit = context.read<PayoutsCubit>();
      payoutsCubit.loadPayments();
    } else if (operationType.contains("recipient")) {
      // Refresh user data after recipient update
      final authCubit = context.read<AuthCubit>();
      authCubit.init();
    }
    // Add more refresh logic for other operation types as needed
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
