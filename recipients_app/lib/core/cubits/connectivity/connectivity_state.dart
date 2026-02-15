class ConnectivityState {
  final bool isOnline;
  final bool isInitialized;

  const ConnectivityState({
    required this.isOnline,
    required this.isInitialized,
  });

  ConnectivityState copyWith({bool? isOnline, bool? isInitialized}) {
    return ConnectivityState(
      isOnline: isOnline ?? this.isOnline,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }
}
