import "dart:async";

import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/queue/queue_events.dart";
import "package:app/data/services/update_queue_service.dart";
import "package:app/ui/navigation/app_navigation_keys.dart";
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

    // QueueEventListener sits above MaterialApp, so use the root navigator
    // context which has access to the Navigator and bloc providers.
    final navContext = rootNavigatorKey.currentContext;
    if (navContext == null) return;

    if (event is QueueSuccessEvent) {
      FlushbarHelper.showFlushbar(navContext, message: event.message);
      _refreshDataAfterSuccess(event.operationType, navContext);
    } else if (event is QueueErrorEvent) {
      FlushbarHelper.showFlushbar(navContext, message: event.message, type: FlushbarType.error);
    }
  }

  void _refreshDataAfterSuccess(String operationType, BuildContext navContext) {
    if (operationType.contains("payment")) {
      navContext.read<PayoutsCubit>().loadPayments();
    } else if (operationType.contains("recipient")) {
      navContext.read<AuthCubit>().init();
    }
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
