import "package:app/account/repository/account_repository.dart";
import "package:app/account/repository/user_account.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "account_state.dart";

class AccountCubit extends Cubit<AccountState> {
  final AccountRepository accountRepository;

  AccountCubit({required this.accountRepository}) : super(const AccountState());

  Future<void> fetchUser() async {
    emit(state.copyWith(status: AccountStatus.loading));

    await Future.delayed(const Duration(seconds: 3));

    try {
      final userAccount = await accountRepository.fetchUser();
      emit(
        state.copyWith(
          status: AccountStatus.success,
          userAccount: userAccount,
        ),
      );
    } on Exception catch (exception) {
      emit(state.copyWith(status: AccountStatus.failure, exception: exception));
    }
  }
}
