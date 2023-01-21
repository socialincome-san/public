import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "signup_state.dart";

class SignupCubit extends Cubit<SignupState> {
  SignupCubit() : super(SignupInitial());
}
