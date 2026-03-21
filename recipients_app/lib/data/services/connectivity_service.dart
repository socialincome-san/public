import "dart:async";

import "package:connectivity_plus/connectivity_plus.dart";
import "package:flutter/widgets.dart";
import "package:http/http.dart" as http;

/// Monitors network connectivity and exposes the current online status via [isOnline]
/// and [isOnlineStream]. Re-checks connectivity on network changes and when the app
/// returns to the foreground. Uses an HTTP reachability probe to confirm actual internet
/// access beyond just having a network interface.
class ConnectivityService with WidgetsBindingObserver {
  final Connectivity _connectivity;
  final Uri _reachabilityUrl;
  late final StreamController<bool> _controller;
  late final StreamSubscription<List<ConnectivityResult>> _subscription;

  bool _isOnline = true;

  ConnectivityService({required Connectivity connectivity, required Uri reachabilityUrl})
    : _connectivity = connectivity,
      _reachabilityUrl = reachabilityUrl {
    _controller = StreamController<bool>.broadcast();

    _subscription = _connectivity.onConnectivityChanged.listen((results) async {
      final hasConnection = !results.contains(ConnectivityResult.none);
      final online = hasConnection && await _canReachInternet();
      if (online != _isOnline) {
        _isOnline = online;
        _controller.add(_isOnline);
      }
    });

    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkConnectivity();
    }
  }

  Future<void> _checkConnectivity() async {
    final results = await _connectivity.checkConnectivity();
    final hasConnection = !results.contains(ConnectivityResult.none);
    final online = hasConnection && await _canReachInternet();
    if (online != _isOnline) {
      _isOnline = online;
      _controller.add(_isOnline);
    }
  }

  bool get isOnline => _isOnline;

  Stream<bool> get isOnlineStream => _controller.stream;

  Future<void> initialize() async {
    _checkConnectivity();
  }

  Future<bool> _canReachInternet() async {
    try {
      final response = await http.get(_reachabilityUrl).timeout(const Duration(seconds: 3));
      return response.statusCode < 500;
    } catch (_) {
      return false;
    }
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _subscription.cancel();
    _controller.close();
  }
}
