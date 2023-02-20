import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "account_state.dart";

class AccountCubit extends Cubit<AccountState> {
  final Recipient recipient;
  final UserRepository userRepository;

  AccountCubit({
    required this.recipient,
    required this.userRepository,
  }) : super(AccountState(recipient: recipient));

  Future<void> updateRecipient(Recipient recipient) async {
    emit(state.copyWith(status: AccountStatus.loading));

    try {
      await userRepository.updateRecipient(recipient);

      emit(
        state.copyWith(
          status: AccountStatus.updated,
          recipient: recipient,
        ),
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: AccountStatus.failure,
          exception: ex,
        ),
      );
    }
  }
}
