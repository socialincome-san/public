import "dart:async";
import "dart:io";

import "package:app/data/enums/balance_card_status.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/data/models/payment/next_payout_data.dart";
import "package:app/data/models/payment/payout.dart";
import "package:app/data/models/payment/payouts_ui_state.dart";
import "package:app/data/models/recipient.dart";
import "package:app/data/repositories/repositories.dart";
import "package:collection/collection.dart";
import "package:dart_mappable/dart_mappable.dart";
import "package:firebase_core/firebase_core.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

part "payouts_cubit.mapper.dart";
part "payouts_state.dart";

const int kMaxReviewDays = 10;
//TODO(migration): get real amount from backend (Model Programm) and remove this constant
const int kCurrentPaymentAmount = 700;
//TODO(migration): get real amount from backend (Model Programm) and remove this constant
const int kProgramDurationMonths = 36;

const _kOnHoldCandidateStates = [PayoutStatus.paid, PayoutStatus.contested];

class PayoutsCubit extends Cubit<PayoutsState> {
  final Recipient recipient;
  final PaymentRepository paymentRepository;
  final CrashReportingRepository crashReportingRepository;

  StreamSubscription<List<Payout>>? _payoutsSubscription;

  PayoutsCubit({
    required this.recipient,
    required this.paymentRepository,
    required this.crashReportingRepository,
  }) : super(const PayoutsState());

  Future<void> loadPayments() async {
    emit(state.copyWith(status: PayoutsStatus.loading));

    _payoutsSubscription?.cancel();
    _payoutsSubscription = paymentRepository.fetchPayouts().listen(
      (payouts) async {
        emit(
          state.copyWith(
            status: PayoutsStatus.success,
            payoutsUiState: await _mapPayoutsUiState(payouts),
          ),
        );
      },
      onError: (Object error, StackTrace stackTrace) {
        if (error is SocketException || (error is FirebaseException && error.code == "unknown")) {
          // Do not log this kind of errors in Sentry as they are caused by network issues on the client side
          // and do not indicate a problem in the app itself.
        } else {
          crashReportingRepository.logError(error is Exception ? error : Exception(error.toString()), stackTrace);
        }
        emit(
          state.copyWith(
            status: PayoutsStatus.failure,
            exception: error is Exception ? error : Exception(error.toString()),
          ),
        );
      },
    );
  }

  Future<void> confirmPayment(Payout payout) async {
    emit(state.copyWith(status: PayoutsStatus.loading));

    try {
      await paymentRepository.confirmPayment(
        payoutId: payout.id,
      );

      // Re-fetch payouts after mutation
      await loadPayments();
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: PayoutsStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<void> contestPayment(
    Payout payout,
    String contestReason,
  ) async {
    emit(state.copyWith(status: PayoutsStatus.loading));

    try {
      await paymentRepository.contestPayment(
        payoutId: payout.id,
        contestReason: contestReason,
      );

      // Re-fetch payouts after mutation
      await loadPayments();
    } on Exception catch (ex, stackTrace) {
      crashReportingRepository.logError(ex, stackTrace);
      emit(
        state.copyWith(
          status: PayoutsStatus.failure,
          exception: ex,
        ),
      );
    }
  }

  Future<PayoutsUiState> _mapPayoutsUiState(List<Payout> payouts) async {
    var unconfirmedPaymentsCount = 0;
    var confirmedPaymentsCount = 0;
    final List<MappedPayout> mappedPayments = [];

    PayoutStatus? previousState;

    for (int i = 0; i < payouts.length; i++) {
      final currentPayment = payouts[i];
      PayoutUiStatus paymentUiStatus = PayoutUiStatus.empty;
      switch (currentPayment.status) {
        case PayoutStatus.created:
          paymentUiStatus = PayoutUiStatus.toBePaid;
        case PayoutStatus.paid:
          final isRecent = _isRecent(currentPayment);
          paymentUiStatus = isRecent ? PayoutUiStatus.recentToReview : PayoutUiStatus.toReview;
          unconfirmedPaymentsCount++;
        case PayoutStatus.confirmed:
          paymentUiStatus = PayoutUiStatus.confirmed;
          confirmedPaymentsCount++;
        case PayoutStatus.contested:
          paymentUiStatus = PayoutUiStatus.contested;
        // TODO: check what to show in case of those statuses
        case PayoutStatus.failed:
        case PayoutStatus.other:
          paymentUiStatus = PayoutUiStatus.empty;
      }

      if (_kOnHoldCandidateStates.contains(previousState) &&
          _kOnHoldCandidateStates.contains(currentPayment.status) &&
          !_isRecent(currentPayment)) {
        mappedPayments[i - 1] = mappedPayments[i - 1].copyWith(
          uiStatus: _getOnHoldStatus(mappedPayments[i - 1].payout),
        );
        paymentUiStatus = _getOnHoldStatus(currentPayment);
      }

      previousState = currentPayment.status;
      mappedPayments.add(
        MappedPayout(
          payout: currentPayment,
          uiStatus: paymentUiStatus,
        ),
      );
    }

    final reversedMappedPayments = mappedPayments.reversed.toList();

    return PayoutsUiState(
      status: _getBalanceCardStatus(
        reversedMappedPayments,
        unconfirmedPaymentsCount,
      ),
      payouts: reversedMappedPayments,
      confirmedPayoutsCount: confirmedPaymentsCount,
      unconfirmedPayoutsCount: unconfirmedPaymentsCount,
      nextPayout: _getNextPaymentData(reversedMappedPayments),
      lastPaidPayout: _getLastPaidPayment(reversedMappedPayments),
    );
  }

  BalanceCardStatus _getBalanceCardStatus(
    List<MappedPayout> mappedPayments,
    int unconfirmedPaymentsCount,
  ) {
    BalanceCardStatus balanceCardStatus = BalanceCardStatus.allConfirmed;
    if (mappedPayments.any(
      (element) =>
          element.uiStatus == PayoutUiStatus.onHoldContested || element.uiStatus == PayoutUiStatus.onHoldToReview,
    )) {
      balanceCardStatus = BalanceCardStatus.onHold;
    } else if (unconfirmedPaymentsCount == 1 &&
        mappedPayments.any(
          (element) => element.uiStatus == PayoutUiStatus.recentToReview,
        )) {
      balanceCardStatus = BalanceCardStatus.recentToReview;
    } else if (unconfirmedPaymentsCount > 0) {
      balanceCardStatus = BalanceCardStatus.needsAttention;
    }

    return balanceCardStatus;
  }

  bool _isRecent(Payout? payout) {
    if (payout == null) {
      return false;
    }

    // checks if days between payment date and now are less than 5
    return ((payout.paymentAt.difference(DateTime.now()).inDays) * -1) < kMaxReviewDays;
  }

  NextPayoutData _getNextPaymentData(
    List<MappedPayout> mappedPayments,
  ) {
    final nextPayment = mappedPayments.firstWhereOrNull(
      (element) => element.uiStatus == PayoutUiStatus.toBePaid,
    );

    final previousPaymentDate = mappedPayments
        .firstWhereOrNull(
          (element) => element.uiStatus != PayoutUiStatus.toBePaid,
        )
        ?.payout
        .paymentAt;

    final nextPaymentDate =
        nextPayment?.payout.paymentAt ??
        DateTime(
          previousPaymentDate?.year ?? 2023,
          (previousPaymentDate?.month ?? 1) + 1,
          previousPaymentDate?.day ?? 15,
        );
    final daysToPayment = DateUtils.dateOnly(nextPaymentDate).difference(DateUtils.dateOnly(DateTime.now())).inDays;

    return NextPayoutData(
      amount: nextPayment?.payout.amount ?? kCurrentPaymentAmount,
      currency: nextPayment?.payout.currency ?? "???",
      daysToPayout: daysToPayment,
    );
  }

  PayoutUiStatus _getOnHoldStatus(Payout payout) {
    PayoutUiStatus paymentUiStatus;
    if (payout.status == PayoutStatus.contested) {
      paymentUiStatus = PayoutUiStatus.onHoldContested;
    } else {
      paymentUiStatus = PayoutUiStatus.onHoldToReview;
    }
    return paymentUiStatus;
  }

  @override
  Future<void> close() {
    _payoutsSubscription?.cancel();
    return super.close();
  }

  MappedPayout? _getLastPaidPayment(List<MappedPayout> payments) {
    final MappedPayout? lastPaidPayment;
    final lastPayment = payments.firstOrNull;
    if (lastPayment == null) {
      lastPaidPayment = null;
    } else if (lastPayment.uiStatus != PayoutUiStatus.toBePaid) {
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
