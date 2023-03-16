import "package:app/core/cubits/auth/auth_cubit.dart";
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

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Column(
          children: [
            Text(
              recipient?.firstName ?? "",
              style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                    color: AppColors.primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              "+${recipient?.mobileMoneyPhone?.phoneNumber}",
              style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                    color: AppColors.primaryColor,
                  ),
              //_pags.elementAt(_selectedIndex).keys.first,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: AppColors.primaryColor),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => const AccountPage(),
              ),
            ),
          ),
        ],
      ),
      body: const DashboardPage(),
      backgroundColor: AppColors.backgroundColor,
    );
  }
}
