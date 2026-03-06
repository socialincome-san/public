import "dart:async";

import "package:app/data/database/app_database.dart";
import "package:app/data/services/update_queue_service.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

/// Debug page that shows all queue operations (only visible in kDebugMode)
class DebugQueuePage extends StatefulWidget {
  final UpdateQueueService queueService;

  const DebugQueuePage({
    super.key,
    required this.queueService,
  });

  @override
  State<DebugQueuePage> createState() => _DebugQueuePageState();
}

class _DebugQueuePageState extends State<DebugQueuePage> {
  late Future<List<UpdateQueueData>> _operationsFuture;
  late final StreamSubscription<int> _subscription;

  @override
  void initState() {
    super.initState();
    _loadOperations();
    _subscription = widget.queueService.pendingCountStream.listen((count) {
      // Reload operations when queue changes
      _loadOperations();
    });
  }

  void _loadOperations() {
    setState(() {
      _operationsFuture = widget.queueService.getAllOperations();
    });
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Queue Operations"),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadOperations,
            tooltip: "Refresh",
          ),
        ],
      ),
      body: FutureBuilder<List<UpdateQueueData>>(
        future: _operationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text("Error: ${snapshot.error}"),
            );
          }

          final operations = snapshot.data ?? [];

          if (operations.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
                  SizedBox(height: 16),
                  Text("No queue operations"),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: operations.length,
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final operation = operations[index];
              return _QueueOperationCard(operation: operation);
            },
          );
        },
      ),
    );
  }
}

class _QueueOperationCard extends StatelessWidget {
  final UpdateQueueData operation;

  const _QueueOperationCard({required this.operation});

  Color _getStatusColor(String status) {
    switch (status) {
      case "pending":
        return Colors.blue;
      case "processing":
        return Colors.orange;
      case "failed":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case "pending":
        return Icons.schedule;
      case "processing":
        return Icons.sync;
      case "failed":
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return DateFormat("MMM dd, yyyy HH:mm:ss").format(dateTime);
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(operation.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getStatusIcon(operation.status),
                  color: statusColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    operation.operationType.replaceAll("_", " ").toUpperCase(),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    operation.status.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _InfoRow(
              icon: Icons.access_time,
              label: "Created",
              value: _formatDateTime(operation.createdAt),
            ),
            _InfoRow(
              icon: Icons.replay,
              label: "Retry Count",
              value: "${operation.retryCount}",
            ),
            if (operation.error != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.error, color: Colors.red, size: 16),
                        SizedBox(width: 4),
                        Text(
                          "Error",
                          style: TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      operation.error!,
                      style: const TextStyle(
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            "$label:",
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
