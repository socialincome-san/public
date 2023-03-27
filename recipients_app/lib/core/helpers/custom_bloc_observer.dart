import "dart:developer";

import "package:flutter_bloc/flutter_bloc.dart";

class CustomBlocObserver extends BlocObserver {
  @override
  void onCreate(BlocBase<dynamic> bloc) {
    super.onCreate(bloc);
    log("onCreate -- ${bloc.runtimeType} -- ${bloc.hashCode}");
  }

  @override
  void onChange(BlocBase<dynamic> bloc, Change<dynamic> change) {
    super.onChange(bloc, change);
    log("onChange -- ${bloc.runtimeType}, $change -- ${bloc.hashCode}");
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log("onError -- ${bloc.runtimeType}, $error  -- ${bloc.hashCode}");
    super.onError(bloc, error, stackTrace);
  }

  @override
  void onClose(BlocBase<dynamic> bloc) {
    super.onClose(bloc);
    log("onClose -- ${bloc.runtimeType} -- ${bloc.hashCode}");
  }
}
