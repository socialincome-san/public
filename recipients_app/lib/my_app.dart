import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/user_repository.dart";
import "package:app/models/alert_visibility.dart";
import "package:app/models/current_user.dart";
import "package:app/models/registration.dart";
import "package:app/theme/theme.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:provider/provider.dart";

class MyApp extends StatelessWidget {
  final FirebaseAuth firebaseAuth;
  final FirebaseFirestore firestore;

  const MyApp({
    super.key,
    required this.firebaseAuth,
    required this.firestore,
  });

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(
          create: (context) => UserRepository(
            firebaseAuth: firebaseAuth,
            firestore: firestore,
          ),
        ),
      ],
      child: MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (context) => Registration()),
          ChangeNotifierProvider(create: (context) => CurrentUser()),
          ChangeNotifierProvider(create: (context) => AlertVisibility())
        ],
        child: BlocProvider(
          create: (context) => AuthCubit(
            userRepository: context.read<UserRepository>(),
          )..init(),
          child: MaterialApp(
            title: "Profile Page",
            theme: socialIncomeTheme,
            home: BlocBuilder<AuthCubit, AuthState>(
              builder: (context, state) {
                switch (state.status) {
                  case AuthStatus.unauthenticated:
                  case AuthStatus.failure:
                    return const WelcomePage();
                  case AuthStatus.authenticated:
                    return MainAppPage();
                }
              },
            ),
            debugShowCheckedModeBanner: false,
          ),
        ),
      ),
    );
  }
}
