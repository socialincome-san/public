import "dart:async";

import "package:app/core/cubits/connectivity/connectivity_state.dart";
import "package:connectivity_plus/connectivity_plus.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class ConnectivityCubit extends Cubit<ConnectivityState> {
  final Connectivity connectivity;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  ConnectivityCubit({required this.connectivity}) : super(const ConnectivityState(isOnline: true, isInitialized: false));

  Future<void> initialize() async {
    // Check initial connectivity
    final result = await connectivity.checkConnectivity();
    final isOnline = _isOnline(result);

    emit(ConnectivityState(isOnline: isOnline, isInitialized: true));

    // Listen to connectivity changes
    _subscription = connectivity.onConnectivityChanged.listen((results) {
      final isOnline = _isOnline(results);
      emit(ConnectivityState(isOnline: isOnline, isInitialized: true));
    });
  }

  bool _isOnline(List<ConnectivityResult> results) {
    return results.any((result) =>
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet);
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
