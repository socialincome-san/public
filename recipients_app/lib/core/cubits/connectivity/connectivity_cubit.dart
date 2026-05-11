import "dart:async";

import "package:app/core/cubits/connectivity/connectivity_state.dart";
import "package:app/data/services/connectivity_service.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class ConnectivityCubit extends Cubit<ConnectivityState> {
  final ConnectivityService connectivityService;
  late final StreamSubscription<bool> _subscription;

  ConnectivityCubit({required this.connectivityService})
    : super(ConnectivityState(isOnline: connectivityService.isOnline)) {
    _subscription = connectivityService.isOnlineStream.listen((isOnline) {
      emit(ConnectivityState(isOnline: isOnline));
    });
  }

  @override
  Future<void> close() {
    _subscription.cancel();
    return super.close();
  }
}
