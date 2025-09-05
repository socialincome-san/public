import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/models/recipient.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/buttons/button_small.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/pages/dashboard_page.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class MainAppPage extends StatefulWidget {
  const MainAppPage({super.key});

  @override
  State<MainAppPage> createState() => _MainAppPageState();
}

class _MainAppPageState extends State<MainAppPage> {
  @override
  Widget build(BuildContext context) {
    final recipient = context.watch<AuthCubit>().state.recipient;

    final editButtonRow = Row(
      children: [
        ButtonSmall(
          onPressed: () {
            if (recipient == null) return;
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => AccountPage(recipient: recipient),
              ),
            );
          },
          label: context.l10n.edit,
          buttonType: ButtonSmallType.outlined,
          color: AppColors.fontColorDark,
        ),
        const SizedBox(width: 8),
      ],
    );

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Row(
          children: [
            Visibility(
              visible: false,
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: editButtonRow,
            ),
            Expanded(
              child: Center(
                child: Column(
                  children: [
                    Text(
                      _getName(recipient),
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        color: AppColors.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "+${recipient?.mobileMoneyPhone?.phone}",
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Visibility(child: editButtonRow),
          ],
        ),
      ),
      body: const DashboardPage(),
      backgroundColor: AppColors.backgroundColor,
    );
  }

  String _getName(Recipient? recipient) {
    final preferredName = recipient?.callingName;
    var name = "";
    if (preferredName != null && preferredName.isNotEmpty) {
      name = preferredName;
    } else {
      name = recipient?.user.firstName ?? "";
    }

    return name;
  }
}
