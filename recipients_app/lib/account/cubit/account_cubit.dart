import "package:app/data/repositories/repositories.dart";
import "package:app/models/recipient.dart";
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
  // We are getting the recipient from the AuthCubit already, no need to retrieve it again.
  /* Future<void> loadRecipientData() async {
    emit(state.copyWith(status: AccountStatus.loading));

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
  } */
}
