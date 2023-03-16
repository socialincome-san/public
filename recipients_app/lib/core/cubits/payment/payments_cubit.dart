import "package:app/data/models/recipient.dart";
import "package:app/data/models/social_income_payment.dart";
import "package:app/data/repositories/repositories.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "payments_state.dart";

class PaymentsCubit extends Cubit<PaymentsState> {
  final Recipient recipient;
  final PaymentRepository paymentRepository;

  PaymentsCubit({
    required this.recipient,
    required this.paymentRepository,
  }) : super(const PaymentsState());

  Future<void> loadPayments() async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      emit(
        state.copyWith(
          status: PaymentsStatus.success,
          payments: await paymentRepository.fetchPayments(
            recipientId: recipient.userId,
          ),
        ),
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: PaymentsStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> confirmPayment(SocialIncomePayment payment) async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      await paymentRepository.confirmPayment(
        recipientId: recipient.userId,
        payment: payment,
      );

      emit(
        state.copyWith(
          status: PaymentsStatus.success,
          payments: await paymentRepository.fetchPayments(
            recipientId: recipient.userId,
          ),
        ),
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: PaymentsStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> contestPayment(
    SocialIncomePayment payment,
    String contestReason,
  ) async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      await paymentRepository.contestPayment(
        recipientId: recipient.userId,
        payment: payment,
        contestReason: contestReason,
      );

      emit(
        state.copyWith(
          status: PaymentsStatus.success,
          payments: await paymentRepository.fetchPayments(
            recipientId: recipient.userId,
          ),
        ),
      );
    } on Exception catch (ex) {
      emit(
        state.copyWith(
          status: PaymentsStatus.failure,
          exception: ex,
        ),
      );
    }
  }
}
