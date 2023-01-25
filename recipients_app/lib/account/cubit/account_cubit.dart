import "package:app/data/repositories/repositories.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "account_state.dart";

class AccountCubit extends Cubit<AccountState> {
  final UserRepository userRepository;

  AccountCubit({required this.userRepository}) : super(const AccountState());
}
