import "package:app/ui/configs/app_colors.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/pages/dashboard_page.dart";
import "package:app/view/pages/impact_measurement_page.dart";
import "package:flutter/material.dart";

class MainAppPage extends StatefulWidget {
  const MainAppPage({super.key});

  @override
  State<MainAppPage> createState() => _MainAppPageState();
}

class _MainAppPageState extends State<MainAppPage> {
  int _selectedIndex = 1;

  final List<Map<String, Widget>> _pages = [
    {"Account": const AccountPage()},
    {"Income": const DashboardPage()},
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
              label: "Account",
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
