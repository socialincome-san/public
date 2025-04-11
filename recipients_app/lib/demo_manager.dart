import "dart:async";

class DemoManager {
  factory DemoManager() {
    return _instance;
  }

  DemoManager._privateConstructor() {
    _isDemoEnabled = false;
    _controller.add(false);
  }

  static final DemoManager _instance = DemoManager._privateConstructor();

  bool _isDemoEnabled = false;

  final _controller = StreamController<bool>.broadcast();
  Stream<bool> get isDemoEnabledStream => _controller.stream;

  set isDemoEnabled(bool value) {
    _isDemoEnabled = value;
    _controller.add(_isDemoEnabled);
  }

  bool get isDemoEnabled => _isDemoEnabled;
}
