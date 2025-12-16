import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/data/enums/payout_ui_status.dart";
import "package:app/data/models/payment/mapped_payout.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class PaymentTileBottomAction extends StatelessWidget {
  final MappedPayout mappedPayment;

  const PaymentTileBottomAction({
    super.key,
    required this.mappedPayment,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(mappedPayment.uiStatus);
    final isContested =
        mappedPayment.uiStatus == PayoutUiStatus.contested || mappedPayment.uiStatus == PayoutUiStatus.onHoldContested;

    return Container(
      color: _getBackgroundColor(mappedPayment.uiStatus),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                isContested ? context.l10n.underInvestigation : context.l10n.didYouGetSocialIncome,
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () => context.read<PayoutsCubit>().confirmPayment(mappedPayment.payout),
                  label: isContested ? context.l10n.resolved : context.l10n.yes,
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (!isContested) ...[
                  const SizedBox(width: 8),
                  ButtonSmall(
                    onPressed: () => _onPressedNo(context),
                    label: context.l10n.no,
                    buttonType: ButtonSmallType.outlined,
                    color: foregroundColor,
                    fontColor: foregroundColor,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onPressedNo(BuildContext context) {
    final paymentsCubit = context.read<PayoutsCubit>();
    showDialog(
      context: context,
      builder: (context) => BlocProvider.value(
        value: paymentsCubit,
        child: ReviewPaymentModal(mappedPayment.payout),
      ),
    );
  }

  Color _getBackgroundColor(PayoutUiStatus status) {
    switch (status) {
      case PayoutUiStatus.onHoldContested:
      case PayoutUiStatus.onHoldToReview:
        return AppColors.redColor;
      case PayoutUiStatus.toReview:
      case PayoutUiStatus.contested:
        return AppColors.yellowColor;
      default:
        return AppColors.primaryColor;
    }
  }

  Color _getForegroundColor(PayoutUiStatus status) {
    switch (status) {
      case PayoutUiStatus.onHoldContested:
      case PayoutUiStatus.onHoldToReview:
        return AppColors.fontColorDark;
      case PayoutUiStatus.toReview:
      case PayoutUiStatus.contested:
        return AppColors.fontColorDark;
      default:
        return Colors.white;
    }
  }
}
