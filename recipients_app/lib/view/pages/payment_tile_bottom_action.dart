import "package:app/core/cubits/payment/payments_cubit.dart";
import "package:app/data/models/payment/payment.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/income/review_payment_modal.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class PaymentTileBottomAction extends StatelessWidget {
  final MappedPayment mappedPayment;

  const PaymentTileBottomAction({
    super.key,
    required this.mappedPayment,
  });

  @override
  Widget build(BuildContext context) {
    final foregroundColor = _getForegroundColor(mappedPayment.uiStatus);

    return Container(
      color: _getBackgroundColor(mappedPayment.uiStatus),
      child: Padding(
        padding: AppSpacings.a16,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                "Did you get your Social Income?",
                style: TextStyle(color: foregroundColor),
              ),
            ),
            Row(
              children: [
                ButtonSmall(
                  onPressed: () => context
                      .read<PaymentsCubit>()
                      .confirmPayment(mappedPayment.payment),
                  label: "Yes",
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
                const SizedBox(width: 8),
                ButtonSmall(
                  onPressed: () {
                    final paymentsCubit = context.read<PaymentsCubit>();
                    showModalBottomSheet(
                      isScrollControlled: true,
                      context: context,
                      builder: (context) => BlocProvider.value(
                        value: paymentsCubit,
                        child: ReviewPaymentModal(mappedPayment.payment),
                      ),
                    );
                  },
                  label: "No",
                  buttonType: ButtonSmallType.outlined,
                  color: foregroundColor,
                  fontColor: foregroundColor,
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Color _getBackgroundColor(PaymentUiStatus status) {
    switch (status) {
      case PaymentUiStatus.onHold:
        return AppColors.redColor;
      case PaymentUiStatus.toReview:
        return AppColors.yellowColor;
      default:
        return AppColors.primaryColor;
    }
  }

  Color _getForegroundColor(PaymentUiStatus status) {
    switch (status) {
      case PaymentUiStatus.onHold:
        return AppColors.fontColorDark;
      case PaymentUiStatus.toReview:
        return AppColors.fontColorDark;
      default:
        return Colors.white;
    }
  }
}
