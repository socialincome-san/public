import "dart:async";

import "package:connectivity_plus/connectivity_plus.dart";
import "package:http/http.dart" as http;

class ConnectivityService {
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
  }

  bool get isOnline => _isOnline;

  Stream<bool> get isOnlineStream => _controller.stream;

  Future<void> initialize() async {
    final results = await _connectivity.checkConnectivity();
    final hasConnection = !results.contains(ConnectivityResult.none);
    _isOnline = hasConnection && await _canReachInternet();
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
    _subscription.cancel();
    _controller.close();
  }
}
