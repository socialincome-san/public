class ConnectivityState {
  final bool isOnline;

  const ConnectivityState({this.isOnline = true});

  @override
  bool operator ==(Object other) {
    return identical(this, other) || other is ConnectivityState && other.isOnline == isOnline;
  }

  @override
  int get hashCode {
    return isOnline.hashCode;
  }
}
