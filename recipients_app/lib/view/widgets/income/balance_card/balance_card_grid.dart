import "dart:math" as math;

import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/ui/icons/payment_status_icon.dart";
import "package:flutter/material.dart";

const _maxPaymentsPerRow = 8;
const _paymentSpacing = 6.0;

class BalanceCardGrid extends StatelessWidget {
  final List<MappedPayout> payments;
  final int programTotalCountOfPayments;

  const BalanceCardGrid({
    super.key,
    required this.payments,
    required this.programTotalCountOfPayments,
  });

  @override
  Widget build(BuildContext context) {
    final paymentsStartingFromOldest = payments.toList();
    final paymentStatuses = List.generate(programTotalCountOfPayments, (index) {
      if (index < paymentsStartingFromOldest.length) {
        return paymentsStartingFromOldest[index].uiStatus;
      }

      if (!paymentsStartingFromOldest.any(
            (element) => element.uiStatus == PayoutUiStatus.toBePaid,
          ) &&
          index == paymentsStartingFromOldest.length) {
        return PayoutUiStatus.toBePaid;
      }

      return PayoutUiStatus.empty;
    });
    final rowCount = (paymentStatuses.length + _maxPaymentsPerRow - 1) ~/ _maxPaymentsPerRow;
    final paymentsPerRow = rowCount == 0 ? 0 : paymentStatuses.length ~/ rowCount;
    final rowsWithExtraPayment = rowCount == 0 ? 0 : paymentStatuses.length % rowCount;

    return LayoutBuilder(
      builder: (context, constraints) {
        final paymentSizeByWidth =
            (constraints.maxWidth - _paymentSpacing * (_maxPaymentsPerRow - 1)) / _maxPaymentsPerRow;
        final rowSpacing = constraints.maxHeight.isFinite && rowCount > 1
            ? math.min(
                _paymentSpacing,
                constraints.maxHeight / (rowCount - 1),
              )
            : _paymentSpacing;
        final paymentSizeByHeight = rowCount == 0 || !constraints.maxHeight.isFinite
            ? double.infinity
            : (constraints.maxHeight - rowSpacing * (rowCount - 1)) / rowCount;
        final paymentSize = math.max(
          0.0,
          math.min(paymentSizeByWidth, paymentSizeByHeight),
        );
        var firstPaymentInRow = 0;

        return Column(
          children: List.generate(rowCount, (rowIndex) {
            final rowPaymentCount = paymentsPerRow + (rowIndex < rowsWithExtraPayment ? 1 : 0);
            final row = Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(rowPaymentCount, (columnIndex) {
                final status = paymentStatuses[firstPaymentInRow + columnIndex];
                return Padding(
                  padding: EdgeInsets.only(
                    right: columnIndex < rowPaymentCount - 1 ? _paymentSpacing : 0,
                  ),
                  child: SizedBox.square(
                    dimension: paymentSize,
                    child: PaymentStatusIcon(status: status),
                  ),
                );
              }),
            );
            firstPaymentInRow += rowPaymentCount;

            return Padding(
              padding: EdgeInsets.only(
                bottom: rowIndex < rowCount - 1 ? rowSpacing : 0,
              ),
              child: row,
            );
          }),
        );
      },
    );
  }
}
