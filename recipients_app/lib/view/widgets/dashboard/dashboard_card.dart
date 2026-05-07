import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/dashboard_card_manager/dashboard_card_manager_cubit.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/widgets/dashboard/dashboard_item.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

enum DashboardCardType {
  contactNumberEqualsPaymentNumber,
}

class DashboardCard extends DashboardItem {
  final DashboardCardType type;

  const DashboardCard({
    required this.type,
  });

  ({String title, String message, String primaryButtonText, String secondaryButtonText}) _resolveStrings(
    BuildContext context,
  ) {
    switch (type) {
      case DashboardCardType.contactNumberEqualsPaymentNumber:
        final paymentPhoneNumber = context.read<AuthCubit>().state.recipient?.paymentInformation?.phone.number ?? "";
        return (
          title: context.l10n.myProfile,
          message: context.l10n.contactPhoneQuestion(paymentPhoneNumber),
          primaryButtonText: context.l10n.yes,
          secondaryButtonText: context.l10n.no,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUpdating = context.watch<DashboardCardManagerCubit>().state.status == DashboardCardManagerStatus.updating;
    final strings = _resolveStrings(context);

    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Padding(
            padding: AppSpacings.a16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  strings.title,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                Text(
                  strings.message,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: AppSpacings.a16,
            color: AppColors.yellowColor,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ButtonSmall(
                  isLoading: isUpdating,
                  color: Colors.black,
                  label: strings.primaryButtonText,
                  onPressed: () => _onPressPrimary(context),
                  buttonType: ButtonSmallType.outlined,
                ),
                const SizedBox(width: 8),
                ButtonSmall(
                  isLoading: isUpdating,
                  color: Colors.black,
                  onPressed: () => _onPressSecondary(context),
                  label: strings.secondaryButtonText,
                  buttonType: ButtonSmallType.outlined,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _onPressSecondary(BuildContext context) {
    switch (type) {
      /// On pressing no, user should be forwarded to account page
      /// to fill missing information
      case DashboardCardType.contactNumberEqualsPaymentNumber:
        final recipient = context.read<AuthCubit>().state.recipient!;

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => AccountPage(recipient: recipient),
          ),
        );
    }
  }

  void _onPressPrimary(BuildContext context) {
    switch (type) {
      case DashboardCardType.contactNumberEqualsPaymentNumber:
        context.read<DashboardCardManagerCubit>().updateContactNumber();
    }
  }
}
