import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

class PaymentTileBottomAction extends StatelessWidget {
  final MappedPayment mappedPayment;

  const PaymentTileBottomAction({
    super.key,
    required this.mappedPayment,
  });

  @override
  Widget build(BuildContext context) {
    final localization = AppLocalizations.of(context)!;

    final foregroundColor = _getForegroundColor(mappedPayment.uiStatus);
    final isContested = mappedPayment.uiStatus == PaymentUiStatus.contested ||
        mappedPayment.uiStatus == PaymentUiStatus.onHoldContested;

    return Container(
      color: _getBackgroundColor(mappedPayment.uiStatus),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                isContested
                    ? localization.underInvestigation
                    : localization.didYouGetSocialIncome,
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () => context
                      .read<PaymentsCubit>()
                      .confirmPayment(mappedPayment.payment),
                  label: isContested ? localization.resolved : localization.yes,
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                if (!isContested) ...[
                  const SizedBox(width: 8),
                  ButtonSmall(
                    onPressed: () => _onPressedNo(context),
                    label: localization.no,
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
    final paymentsCubit = context.read<PaymentsCubit>();
    showDialog(
      context: context,
      builder: (context) => BlocProvider.value(
        value: paymentsCubit,
        child: ReviewPaymentModal(mappedPayment.payment),
      ),
    );
  }

  Color _getBackgroundColor(PaymentUiStatus status) {
    switch (status) {
      case PaymentUiStatus.onHoldContested:
      case PaymentUiStatus.onHoldToReview:
        return AppColors.redColor;
      case PaymentUiStatus.toReview:
      case PaymentUiStatus.contested:
        return AppColors.yellowColor;
      default:
        return AppColors.primaryColor;
    }
  }

  Color _getForegroundColor(PaymentUiStatus status) {
    switch (status) {
      case PaymentUiStatus.onHoldContested:
      case PaymentUiStatus.onHoldToReview:
        return AppColors.fontColorDark;
      case PaymentUiStatus.toReview:
      case PaymentUiStatus.contested:
        return AppColors.fontColorDark;
      default:
        return Colors.white;
    }
  }
}
