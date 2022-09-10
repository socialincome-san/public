import 'package:app/models/currentUser.dart';
import 'package:app/models/navigation.dart';
import 'package:app/services/databaseService.dart';
import 'package:app/theme/theme.dart';
import 'package:app/view/components/account/accountPage.dart';
import 'package:app/view/components/impactMeasurement/impactMeasurementPage.dart';
import 'package:app/view/components/income/IncomePage.dart';
import 'package:app/view/components/termsAndConditions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MainAppPage extends StatelessWidget {
  final PageController controller = PageController(initialPage: 1);

  final List<Widget> content = [
    AccountPage(),
    IncomePage(),
    ImpactMeasurementPage()
  ];

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
            if (currentUser.termsAccepted == true)
              return PageView(
                onPageChanged: (int) {
                  navigation.setIndex(int);
                },
                controller: controller,
                children: content,
              );
            return TermsAndConditions();
          }

          Future<CurrentUser> fetchUserDetails() async {
            var firebaseUser = FirebaseAuth.instance.currentUser;
            if (firebaseUser == null) return currentUser;

            // For now, breaking constant fetching loop when currentUser
            // has already number set as it means that we already
            // initialised this object.
            // It should be done differently probably later after some global rework.
            if (currentUser.phoneNumber != null) {
              return currentUser;
            }

            return await DatabaseService(firebaseUser.phoneNumber)
                .fetchUserDetails(currentUser);
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
                  : Center(child: CircularProgressIndicator()),
            ),
            backgroundColor: backgroundColor,
            bottomNavigationBar: currentUser.termsAccepted == true
                ? BottomNavigationBar(
                    currentIndex: navigation.selectedIndex,
                    onTap: (value) {
                      controller.animateToPage(value,
                          duration: Duration(milliseconds: 100),
                          curve: Curves.easeIn);
                      navigation.setIndex(value);
                    },
                    items: const <BottomNavigationBarItem>[
                        BottomNavigationBarItem(
                          icon: Icon(Icons.people),
                          label: 'Account',
                        ),
                        BottomNavigationBarItem(
                          icon: Icon(Icons.attach_money),
                          label: 'Income',
                        ),
                        BottomNavigationBarItem(
                          icon: Icon(Icons.assignment),
                          label: 'Survey',
                        ),
                      ])
                : null,
          );
        }));
  }
}
