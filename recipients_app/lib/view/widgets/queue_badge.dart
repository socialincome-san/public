import "package:app/data/services/update_queue_service.dart";
import "package:flutter/material.dart";

/// Badge widget that displays the number of pending queue operations
class QueueBadge extends StatelessWidget {
  final UpdateQueueService queueService;

  const QueueBadge({
    super.key,
    required this.queueService,
  });

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: queueService.pendingCountStream,
      initialData: 0,
      builder: (context, snapshot) {
        final count = snapshot.data ?? 0;

        if (count == 0) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.sync,
                size: 16,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
              const SizedBox(width: 4),
              Text(
                "$count pending",
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        );
      },
    );
  }
}
