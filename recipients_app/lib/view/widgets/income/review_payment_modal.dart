import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/model/payout.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/inputs/input_text_area.dart";
import "package:app/ui/inputs/radio_row.dart";
import "package:app/view/widgets/income/review_payment_bottom_action.dart";
import "package:app/view/widgets/income/review_payment_header.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class ReviewPaymentModal extends StatefulWidget {
  final Payout _payout;

  const ReviewPaymentModal(this._payout, {super.key});

  @override
  State<ReviewPaymentModal> createState() => _ReviewPaymentModalState();
}

class _ReviewPaymentModalState extends State<ReviewPaymentModal> {
  ContestReason? _selectedReason;
  bool _firstContestStep = true;
  late final TextEditingController inputController;

  @override
  void initState() {
    super.initState();
    inputController = TextEditingController();
  }

  @override
  void dispose() {
    inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: 0.95,
      heightFactor: 0.8,
      child: Center(
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
            color: Colors.white,
          ),
          child: _firstContestStep
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: AppSpacings.a16,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ReviewPaymentModalHeader(),
                          Padding(
                            padding: AppSpacings.v16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: ContestReason.values.map((ContestReason reason) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: RadioRow(
                                    title: reason.localized(context.l10n),
                                    groupValue: _selectedReason,
                                    value: reason,
                                    onChanged: (value) => setState(() {
                                      _selectedReason = value;
                                    }),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_selectedReason != null && _selectedReason != ContestReason.other) ...[
                      ReviewPaymentBottomAction(
                        actionLabel: context.l10n.submit,
                        onAction: () => _onPressedContest(context, _selectedReason!),
                      ),
                    ],
                    if (_selectedReason != null && _selectedReason == ContestReason.other) ...[
                      ReviewPaymentBottomAction(
                        actionLabel: context.l10n.next,
                        onAction: () => setState(() {
                          _firstContestStep = false;
                        }),
                      ),
                    ],
                  ],
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: AppSpacings.a16,
                      child: Material(
                        color: Colors.white,
                        child: Column(
                          children: [
                            ReviewPaymentModalHeader(),
                            const SizedBox(height: 16),
                            InputTextArea(
                              controller: inputController,
                              hintText: context.l10n.describeWhatHappened,
                            ),
                          ],
                        ),
                      ),
                    ),
                    ReviewPaymentBottomAction(
                      actionLabel: context.l10n.submit,
                      onAction: () {
                        _onPressedContest(
                          context,
                          ContestReason.other,
                          otherReasonComment: inputController.text,
                        );
                      },
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  void _onPressedContest(
    BuildContext context,
    ContestReason reason, {
    String? otherReasonComment,
  }) {
    String otherReasonCommentFormatted = "";
    if (otherReasonComment != null) {
      otherReasonCommentFormatted = ": $otherReasonComment";
    }
    context.read<PaymentsCubit>().contestPayment(
      widget._payout,
      reason.localized(context.l10n) + otherReasonCommentFormatted,
    );
    Navigator.pop(context);
  }
}
