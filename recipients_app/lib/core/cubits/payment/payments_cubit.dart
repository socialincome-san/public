import "package:app/data/models/recipient.dart";
import "package:app/data/models/social_income_payment.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/view/widgets/income/balance_card_status.dart";
import "package:app/view/widgets/income/calculated_payment.dart";
import "package:app/view/widgets/income/calculated_payment_status.dart";
import "package:app/view/widgets/income/calculated_payments_ui_state.dart";
import "package:collection/collection.dart";
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
          calculatedPaymentsUiState: await _calculatePayments(),
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
          calculatedPaymentsUiState: await _calculatePayments(),
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
          calculatedPaymentsUiState: await _calculatePayments(),
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

  Future<CalculatedPaymentsUiState> _calculatePayments() async {
    final payments = await paymentRepository.fetchPayments(
      recipientId: recipient.userId,
    );

    var unconfirmedPaymentsCount = 0;
    final List<CalculatedPayment> calculatedPayments = [];

    PaymentStatus? previousState;

    for (int i = 0; i < payments.length; i++) {
      final currentPayment = payments[i];
      CalculatedPaymentStatus calculatedStatus = CalculatedPaymentStatus.empty;
      switch (currentPayment.status) {
        case PaymentStatus.created:
          calculatedStatus = CalculatedPaymentStatus.toBePaid;
          break;
        case PaymentStatus.paid:
          calculatedStatus = CalculatedPaymentStatus.toReview;
          unconfirmedPaymentsCount++;
          break;
        case PaymentStatus.confirmed:
          calculatedStatus = CalculatedPaymentStatus.confirmed;
          break;
        case PaymentStatus.contested:
          calculatedStatus = CalculatedPaymentStatus.contested;
          break;
        // TODO: check what to show in case of those statuses
        case null:
        case PaymentStatus.failed:
        case PaymentStatus.other:
          calculatedStatus = CalculatedPaymentStatus.empty;
          break;
      }

      if (previousState == PaymentStatus.paid &&
          currentPayment.status == PaymentStatus.paid) {
        calculatedPayments[i - 1] = calculatedPayments[i - 1]
            .copyWith(status: CalculatedPaymentStatus.onHold);
        calculatedStatus = CalculatedPaymentStatus.onHold;
      }

      previousState = currentPayment.status;
      calculatedPayments.add(
        CalculatedPayment(
          payment: currentPayment,
          status: calculatedStatus,
        ),
      );
    }

    BalanceCardStatus balanceCardStatus = BalanceCardStatus.allConfirmed;
    if (calculatedPayments
        .any((element) => element.status == CalculatedPaymentStatus.onHold)) {
      balanceCardStatus = BalanceCardStatus.onHold;
    } else if (unconfirmedPaymentsCount == 1 &&
        _isRecentToConfirm(calculatedPayments)) {
      balanceCardStatus = BalanceCardStatus.recentToConfirm;
    } else if (unconfirmedPaymentsCount > 0) {
      balanceCardStatus = BalanceCardStatus.needsAttention;
    }

    return CalculatedPaymentsUiState(
      status: balanceCardStatus,
      payments: calculatedPayments,
      paymentsCount: payments.length,
      unconfirmedPaymentsCount: unconfirmedPaymentsCount,
      nextPayment: _getNextPaymentData(calculatedPayments),
    );
  }

  bool _isRecentToConfirm(List<CalculatedPayment> calculatedPayments) {
    final calculatedPayment = calculatedPayments.firstWhereOrNull(
      (element) => element.payment.status == PaymentStatus.paid,
    );

    final paymentDate = calculatedPayment?.payment.paymentAt?.toDate();
    final isRecent =
        ((paymentDate?.difference(DateTime.now()).inDays ?? 0) * -1) < 5;

    return isRecent;
  }

  NextPaymentData _getNextPaymentData(
    List<CalculatedPayment> calculatedPayments,
  ) {
    final nextPayment = calculatedPayments.firstWhereOrNull(
      (element) => element.status == CalculatedPaymentStatus.toBePaid,
    );

    final previousDate = calculatedPayments
        .firstWhereOrNull(
          (element) => element.status != CalculatedPaymentStatus.toBePaid,
        )
        ?.payment
        .paymentAt
        ?.toDate();

    final nextDate = nextPayment?.payment.paymentAt?.toDate() ??
        DateTime(
          previousDate?.year ?? 2023,
          (previousDate?.month ?? 1) + 1,
          previousDate?.day ?? 15,
        );
    final daysToPayment = nextDate.difference(DateTime.now()).inDays;

    return NextPaymentData(
      amount: nextPayment?.payment.amount ?? 500,
      currency: nextPayment?.payment.currency ?? "SLE",
      daysToPayment: daysToPayment,
    );
  }
}
