part of "account_cubit.dart";

enum AccountStatus { initial, loading, success, failure }

class AccountState extends Equatable {
  final AccountStatus status;
  final Exception? exception;

  const AccountState({
    this.status = AccountStatus.initial,
    this.exception,
  });

  @override
  List<Object?> get props => [status, exception];

  AccountState copyWith({
    AccountStatus? status,
    Exception? exception,
  }) {
    return AccountState(
      status: status ?? this.status,
      exception: exception ?? this.exception,
    );
  }
}
