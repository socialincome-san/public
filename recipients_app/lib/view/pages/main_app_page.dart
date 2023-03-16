import "package:app/data/models/social_income_payment.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/pages/dashboard_page.dart";
import "package:app/view/pages/impact_measurement_page.dart";
import "package:app/view/pages/income_page.dart";
import "package:app/view/pages/payment_page.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";

class MainAppPage extends StatefulWidget {
  const MainAppPage({super.key});

  @override
  State<MainAppPage> createState() => _MainAppPageState();
}

class _MainAppPageState extends State<MainAppPage> {
  int _selectedIndex = 0;

  final List<Map<String, Widget>> _pages = [
    {"Account": const AccountPage()},
    {"Income": const DashboardPage()},
    {
      "Payments": PaymentPage(
        payments: [
          SocialIncomePayment(
            id: "1",
            amount: 400,
            status: "confirmed",
            currency: "SLE",
            confirmAt: Timestamp(10, 1000),
          ),
          SocialIncomePayment(
            id: "2",
            amount: 400,
            status: "confirmed",
            currency: "SLE",
            confirmAt: Timestamp(10, 1000),
          ),
          SocialIncomePayment(
            id: "3",
            amount: 400,
            status: "confirmed",
            currency: "SLE",
            confirmAt: Timestamp(10, 1000),
          ),
          SocialIncomePayment(
            id: "4",
            amount: 400,
            status: "confirmed",
            currency: "SLE",
            confirmAt: Timestamp(10, 1000),
          ),
          SocialIncomePayment(
            id: "5",
            amount: 400,
            status: "confirmed",
            currency: "SLE",
            confirmAt: Timestamp(10, 1000),
          ),
        ],
      )
    },
    {"Income": const IncomePage()},
    {"Survey": const ImpactMeasurementPage()},
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: _pages.length,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          title: Text(
            _pages.elementAt(_selectedIndex).keys.first,
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.person, color: Colors.white),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const AccountPage(),
                ),
              ),
            ),
          ],
        ),
        body: _pages.elementAt(_selectedIndex).values.first,
        backgroundColor: AppColors.backgroundColor,
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (value) {
            setState(() {
              _selectedIndex = value;
            });
          },
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: Icon(Icons.people),
              label: "Payments",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.attach_money),
              label: "Income",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment),
              label: "Survey",
            ),
          ],
        ),
      ),
    );
  }
}
