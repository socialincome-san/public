import "package:app/core/helpers/string_extensions.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:collection/collection.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "payments_cubit.mapper.dart";
part "payments_state.dart";

const int kMaxReviewDays = 10;
const int kCurrentPaymentAmount = 700;
const int kProgramDurationMonths = 36;

const _kOnHoldCandidateStates = [PayoutStatus.paid, PayoutStatus.contested];

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
      final payouts = await paymentRepository.fetchPayouts();

      emit(
        state.copyWith(
          status: PaymentsStatus.success,
          paymentsUiState: await _mapPayoutsUiState(payouts),
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

  Future<void> confirmPayment(Payout payout) async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      await paymentRepository.confirmPayment(
        payoutId: payout.id,
      );

      final payouts = await paymentRepository.fetchPayouts();

      final paymentUiState = await _mapPayoutsUiState(payouts);

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
    Payout payout,
    String contestReason,
  ) async {
    emit(state.copyWith(status: PaymentsStatus.loading));

    try {
      await paymentRepository.contestPayment(
        payoutId: payout.id,
        contestReason: contestReason,
      );

      final payouts = await paymentRepository.fetchPayouts();

      final paymentUiState = await _mapPayoutsUiState(payouts);

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

  // TODO: fix this
  Future<PaymentsUiState> _mapPayoutsUiState(List<Payout> payouts) async {
    var unconfirmedPaymentsCount = 0;
    var confirmedPaymentsCount = 0;
    final List<MappedPayment> mappedPayments = [];

    PayoutStatus? previousState;

    for (int i = 0; i < payouts.length; i++) {
      final currentPayment = payouts[i];
      PaymentUiStatus paymentUiStatus = PaymentUiStatus.empty;
      switch (currentPayment.status) {
        case PayoutStatus.created:
          paymentUiStatus = PaymentUiStatus.toBePaid;
        case PayoutStatus.paid:
          final isRecent = _isRecent(currentPayment);
          paymentUiStatus = isRecent ? PaymentUiStatus.recentToReview : PaymentUiStatus.toReview;
          unconfirmedPaymentsCount++;
        case PayoutStatus.confirmed:
          paymentUiStatus = PaymentUiStatus.confirmed;
          confirmedPaymentsCount++;
        case PayoutStatus.contested:
          paymentUiStatus = PaymentUiStatus.contested;
        // TODO: check what to show in case of those statuses
        case PayoutStatus.failed:
        case PayoutStatus.other:
          paymentUiStatus = PaymentUiStatus.empty;
      }

      if (_kOnHoldCandidateStates.contains(previousState) &&
          _kOnHoldCandidateStates.contains(currentPayment.status) &&
          !_isRecent(currentPayment)) {
        mappedPayments[i - 1] = mappedPayments[i - 1].copyWith(
          uiStatus: _getOnHoldStatus(mappedPayments[i - 1].payment),
        );
        paymentUiStatus = _getOnHoldStatus(currentPayment);
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
      lastPaidPayment: _getLastPaidPayment(reversedMappedPayments),
    );
  }

  BalanceCardStatus _getBalanceCardStatus(
    List<MappedPayment> mappedPayments,
    int unconfirmedPaymentsCount,
  ) {
    BalanceCardStatus balanceCardStatus = BalanceCardStatus.allConfirmed;
    if (mappedPayments.any(
      (element) =>
          element.uiStatus == PaymentUiStatus.onHoldContested || element.uiStatus == PaymentUiStatus.onHoldToReview,
    )) {
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

  bool _isRecent(Payout? payout) {
    final paymentDate = payout?.paymentAt;

    if (paymentDate == null) {
      return false;
    }

    final paymentDateTime = DateTime.parse(paymentDate);

    // checks if days between payment date and now are less than 5
    return ((paymentDateTime.difference(DateTime.now()).inDays) * -1) < kMaxReviewDays;
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
        .toDate();

    final nextPaymentDate =
        nextPayment?.payment.paymentAt.toDate() ??
        DateTime(
          previousPaymentDate?.year ?? 2023,
          (previousPaymentDate?.month ?? 1) + 1,
          previousPaymentDate?.day ?? 15,
        );
    final daysToPayment = DateUtils.dateOnly(nextPaymentDate).difference(DateUtils.dateOnly(DateTime.now())).inDays;

    return NextPaymentData(
      amount: nextPayment?.payment.amount ?? kCurrentPaymentAmount,
      currency: nextPayment?.payment.currency ?? Currency.sle,
      daysToPayment: daysToPayment,
    );
  }

  PaymentUiStatus _getOnHoldStatus(Payout payout) {
    PaymentUiStatus paymentUiStatus;
    if (payout.status == PayoutStatus.contested) {
      paymentUiStatus = PaymentUiStatus.onHoldContested;
    } else {
      paymentUiStatus = PaymentUiStatus.onHoldToReview;
    }
    return paymentUiStatus;
  }

  MappedPayment? _getLastPaidPayment(List<MappedPayment> payments) {
    final MappedPayment? lastPaidPayment;
    final lastPayment = payments.firstOrNull;
    if (lastPayment == null) {
      lastPaidPayment = null;
    } else if (lastPayment.uiStatus != PaymentUiStatus.toBePaid) {
      // last payment is different then scheduled next payment (to be paid) so we get it
      lastPaidPayment = lastPayment;
    } else if (payments.length > 1) {
      // last payment is scheduled to be paid, so we are trying to get previous paid
      lastPaidPayment = payments.elementAt(1);
    } else {
      lastPaidPayment = null;
    }

    return lastPaidPayment;
  }
}
