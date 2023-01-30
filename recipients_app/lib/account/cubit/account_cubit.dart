import "package:app/data/repositories/repositories.dart";
import "package:app/models/recipient.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "account_state.dart";

class AccountCubit extends Cubit<AccountState> {
  final UserRepository userRepository;

  AccountCubit({required this.userRepository}) : super(const AccountState());

  Future<void> loadRecipientData() async {
    emit(const AccountState(status: AccountStatus.loading));

    final user = userRepository.currentUser;

    if (user == null) {
      emit(
        AccountState(
          status: AccountStatus.failure,
          exception: Exception(""),
        ),
      );
      return;
    }

    try {
      final recipient = await userRepository.fetchRecipient(user);

      emit(
        AccountState(
          status: AccountStatus.success,
          recipient: recipient,
        ),
      );
    } on Exception catch (ex) {
      emit(
        AccountState(
          status: AccountStatus.failure,
          exception: ex,
        ),
      );
    }
  }
}
