part of "account_cubit.dart";

enum AccountStatus { initial, loading, success, failure }

class AccountState extends Equatable {
  final AccountStatus status;
  final UserAccount? userAccount;
  final Exception? exception;

  const AccountState({
    this.status = AccountStatus.initial,
    this.userAccount,
    this.exception,
  });

  @override
  List<Object?> get props => [status, userAccount, exception];

  AccountState copyWith({
    AccountStatus? status,
    UserAccount? userAccount,
    Exception? exception,
  }) {
    return AccountState(
      status: status ?? this.status,
      userAccount: userAccount ?? this.userAccount,
      exception: exception ?? this.exception,
    );
  }
}
