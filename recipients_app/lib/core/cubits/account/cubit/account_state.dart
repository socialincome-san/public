part of "account_cubit.dart";

enum AccountStatus { initial, loading, updated, failure }

class AccountState extends Equatable {
  final AccountStatus status;
  final Recipient recipient;
  final Exception? exception;

  const AccountState({
    this.status = AccountStatus.initial,
    required this.recipient,
    this.exception,
  });

  @override
  List<Object?> get props => [status, recipient, exception];

  AccountState copyWith({
    AccountStatus? status,
    Recipient? recipient,
    Exception? exception,
  }) {
    return AccountState(
      status: status ?? this.status,
      recipient: recipient ?? this.recipient,
      exception: exception ?? this.exception,
    );
  }
}
