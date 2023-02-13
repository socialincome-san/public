import "package:app/core/change_notifiers/current_user.dart";
import "package:app/core/change_notifiers/navigation.dart";
import "package:app/services/database_service.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:app/view/pages/account_page.dart";
import "package:app/view/pages/impact_measurement_page.dart";
import "package:app/view/pages/income_page.dart";
import "package:app/view/widgets/terms_and_conditions.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:provider/provider.dart";

class MainAppPage extends StatelessWidget {
  final PageController controller = PageController(initialPage: 1);

  final List<Widget> content = [
    const AccountPage(),
    const IncomePage(),
    const ImpactMeasurementPage()
  ];

  MainAppPage({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<Navigation>(
          create: (context) => Navigation(),
        )
      ],
      child: Consumer2<Navigation, CurrentUser>(
        builder: (context, navigation, currentUser, child) {
          Widget checkTermsAccepted() {
            if (currentUser.termsAccepted == true) {
              return PageView(
                onPageChanged: (int index) {
                  navigation.setIndex(index);
                },
                controller: controller,
                children: content,
              );
            }
            return const TermsAndConditions();
          }

          Future<CurrentUser> fetchUserDetails() async {
            final firebaseUserPhone =
                FirebaseAuth.instance.currentUser?.phoneNumber;
            if (firebaseUserPhone == null) return currentUser;

            // For now, breaking constant fetching loop when currentUser
            // has already number set as it means that we already
            // initialised this object.
            // It should be done differently probably later after some global rework.
            if (currentUser.phoneNumber != null) {
              return currentUser;
            }

            return DatabaseService().fetchUserDetails(currentUser);
          }

          return Scaffold(
            appBar: AppBar(
              elevation: 0,
              title: Text(navigation.appBarTitle),
            ),
            body: FutureBuilder(
              future: fetchUserDetails(),
              builder: (context, snapshot) => snapshot.hasData
                  ? checkTermsAccepted()
                  : const Center(child: CircularProgressIndicator()),
            ),
            backgroundColor: AppColors.backgroundColor,
            bottomNavigationBar: currentUser.termsAccepted == true
                ? BottomNavigationBar(
                    currentIndex: navigation.selectedIndex,
                    onTap: (value) {
                      controller.animateToPage(
                        value,
                        duration: const Duration(milliseconds: 100),
                        curve: Curves.easeIn,
                      );
                      navigation.setIndex(value);
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
                  )
                : null,
          );
        },
      ),
    );
  }
}
