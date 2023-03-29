import "package:app/data/models/payment/payment.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:collection/collection.dart";
import "package:equatable/equatable.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "payments_state.dart";

const int kMaxReviewDays = 5;

class PaymentsCubit extends Cubit<PaymentsState> {
  final Recipient recipient;
  final PaymentRepository paymentRepository;
  final CrashReportingRepository crashReportingRepository;

  PaymentsCubit({
    required this.recipient,
    required this.paymentRepository,
    required this.crashReportingRepository,
  }) : super(const PaymentsState());

  Future<void> loadPayments() async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      final payments = await paymentRepository.fetchPayments(
        recipientId: recipient.userId,
      );

      emit(
        state.copyWith(
          status: PaymentsStatus.success,
          paymentsUiState: await _mapPaymentsUiState(payments),
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
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

      final payments = await paymentRepository.fetchPayments(
        recipientId: recipient.userId,
      );

      final paymentUiState = await _mapPaymentsUiState(payments);

      emit(
        state.copyWith(
          status: PaymentsStatus.updated,
          paymentsUiState: paymentUiState,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
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

      final payments = await paymentRepository.fetchPayments(
        recipientId: recipient.userId,
      );

      final paymentUiState = await _mapPaymentsUiState(payments);

      emit(
        state.copyWith(
          status: PaymentsStatus.updated,
          paymentsUiState: paymentUiState,
        ),
      );
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: PaymentsStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<PaymentsUiState> _mapPaymentsUiState(
    List<SocialIncomePayment> payments,
  ) async {
    var unconfirmedPaymentsCount = 0;
    var confirmedPaymentsCount = 0;
    final List<MappedPayment> mappedPayments = [];

    PaymentStatus? previousState;

    for (int i = 0; i < payments.length; i++) {
      final currentPayment = payments[i];
      PaymentUiStatus paymentUiStatus = PaymentUiStatus.empty;
      switch (currentPayment.status) {
        case PaymentStatus.created:
          paymentUiStatus = PaymentUiStatus.toBePaid;
          break;
        case PaymentStatus.paid:
          final isRecent = _isRecent(currentPayment);
          paymentUiStatus = isRecent
              ? PaymentUiStatus.recentToReview
              : PaymentUiStatus.toReview;
          unconfirmedPaymentsCount++;
          break;
        case PaymentStatus.confirmed:
          paymentUiStatus = PaymentUiStatus.confirmed;
          confirmedPaymentsCount++;
          break;
        case PaymentStatus.contested:
          paymentUiStatus = PaymentUiStatus.contested;
          break;
        // TODO: check what to show in case of those statuses
        case null:
        case PaymentStatus.failed:
        case PaymentStatus.other:
          paymentUiStatus = PaymentUiStatus.empty;
          break;
      }

      if (previousState == PaymentStatus.paid &&
          currentPayment.status == PaymentStatus.paid &&
          !_isRecent(currentPayment)) {
        mappedPayments[i - 1] =
            mappedPayments[i - 1].copyWith(uiStatus: PaymentUiStatus.onHold);
        paymentUiStatus = PaymentUiStatus.onHold;
      }

      previousState = currentPayment.status;
      mappedPayments.add(
        MappedPayment(
          payment: currentPayment,
          uiStatus: paymentUiStatus,
        ),
      );
    }

    final reversedMappedPayments = mappedPayments.reversed.toList();

    return PaymentsUiState(
      status: _getBalanceCardStatus(
        reversedMappedPayments,
        unconfirmedPaymentsCount,
      ),
      payments: reversedMappedPayments,
      confirmedPaymentsCount: confirmedPaymentsCount,
      unconfirmedPaymentsCount: unconfirmedPaymentsCount,
      nextPayment: _getNextPaymentData(reversedMappedPayments),
    );
  }

  BalanceCardStatus _getBalanceCardStatus(
    List<MappedPayment> mappedPayments,
    int unconfirmedPaymentsCount,
  ) {
    BalanceCardStatus balanceCardStatus = BalanceCardStatus.allConfirmed;
    if (mappedPayments
        .any((element) => element.uiStatus == PaymentUiStatus.onHold)) {
      balanceCardStatus = BalanceCardStatus.onHold;
    } else if (unconfirmedPaymentsCount == 1 &&
        mappedPayments.any(
          (element) => element.uiStatus == PaymentUiStatus.recentToReview,
        )) {
      balanceCardStatus = BalanceCardStatus.recentToReview;
    } else if (unconfirmedPaymentsCount > 0) {
      balanceCardStatus = BalanceCardStatus.needsAttention;
    }

    return balanceCardStatus;
  }

  bool _isRecent(SocialIncomePayment? payment) {
    final paymentDate = payment?.paymentAt?.toDate();

    // checks if days between payment date and now are less than 5
    return ((paymentDate?.difference(DateTime.now()).inDays ?? 0) * -1) <
        kMaxReviewDays;
  }

  NextPaymentData _getNextPaymentData(
    List<MappedPayment> mappedPayments,
  ) {
    final nextPayment = mappedPayments.firstWhereOrNull(
      (element) => element.uiStatus == PaymentUiStatus.toBePaid,
    );

    final previousPaymentDate = mappedPayments
        .firstWhereOrNull(
          (element) => element.uiStatus != PaymentUiStatus.toBePaid,
        )
        ?.payment
        .paymentAt
        ?.toDate();

    final nextPaymentDate = nextPayment?.payment.paymentAt?.toDate() ??
        DateTime(
          previousPaymentDate?.year ?? 2023,
          (previousPaymentDate?.month ?? 1) + 1,
          previousPaymentDate?.day ?? 15,
        );
    final daysToPayment = nextPaymentDate.difference(DateTime.now()).inDays;

    return NextPaymentData(
      amount: nextPayment?.payment.amount ?? 500,
      currency: nextPayment?.payment.currency ?? "SLE",
      daysToPayment: daysToPayment,
    );
  }
}
