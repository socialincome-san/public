import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/dashboard_card_manager/dashboard_card_manager_cubit.dart";
import "package:app/ui/buttons/buttons.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

enum DashboardCardType {
  contactNumberEqualsPaymentNumber,
}

class DashboardCard extends DashboardItem {
  final String title;
  final String message;
  final String primaryButtonText;
  final String secondaryButtonText;
  final DashboardCardType type;

  const DashboardCard({
    required this.title,
    required this.message,
    required this.primaryButtonText,
    required this.secondaryButtonText,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
    final isUpdating = context.watch<DashboardCardManagerCubit>().state.status == DashboardCardManagerStatus.updating;

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
                  title,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                Text(
                  message,
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
                  label: primaryButtonText,
                  onPressed: () => _onPressPrimary(context),
                  buttonType: ButtonSmallType.outlined,
                ),
                const SizedBox(width: 8),
                ButtonSmall(
                  isLoading: isUpdating,
                  color: Colors.black,
                  onPressed: () => _onPressSecondary(context),
                  label: secondaryButtonText,
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
