import "dart:async";

import "package:connectivity_plus/connectivity_plus.dart";

class ConnectivityService {
  final Connectivity _connectivity;
  late final StreamController<bool> _controller;
  late final StreamSubscription<List<ConnectivityResult>> _subscription;

  bool _isOnline = true;

  ConnectivityService({Connectivity? connectivity}) : _connectivity = connectivity ?? Connectivity() {
    _controller = StreamController<bool>.broadcast();

    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      final online = !results.contains(ConnectivityResult.none);
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
    _isOnline = !results.contains(ConnectivityResult.none);
  }

  void dispose() {
    _subscription.cancel();
    _controller.close();
  }
}
