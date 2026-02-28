part of "dashboard_card_manager_cubit.dart";

enum DashboardCardManagerStatus {
  initial,
  loading,
  loaded,
  updating,
  updated,
  error,
}

@MappableClass()
class DashboardCardManagerState with DashboardCardManagerStateMappable {
  final DashboardCardManagerStatus status;
  final List<DashboardCard> cards;
  final Exception? exception;

  const DashboardCardManagerState({
    this.status = DashboardCardManagerStatus.initial,
    this.cards = const [],
    this.exception,
  });
}
