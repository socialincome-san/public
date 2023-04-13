part of "dashboard_card_manager_cubit.dart";

enum DashboardCardManagerStatus { initial, loading, loaded, error }

class DashboardCardManagerState extends Equatable {
  final DashboardCardManagerStatus status;
  final List<DashboardCard> cards;
  final Exception? exception;

  const DashboardCardManagerState({
    this.status = DashboardCardManagerStatus.initial,
    this.cards = const [],
    this.exception,
  });

  @override
  List<Object?> get props => [status, cards, exception];

  DashboardCardManagerState copyWith({
    DashboardCardManagerStatus? status,
    List<DashboardCard>? cards,
    Exception? exception,
  }) {
    return DashboardCardManagerState(
      status: status ?? this.status,
      cards: cards ?? this.cards,
      exception: exception ?? this.exception,
    );
  }
}
