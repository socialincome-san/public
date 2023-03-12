import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_crashlytics/firebase_crashlytics.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class MyApp extends StatelessWidget {
  final FirebaseAuth firebaseAuth;
  final FirebaseFirestore firestore;
  final FirebaseCrashlytics crashlytics;

  const MyApp({
    super.key,
    required this.firebaseAuth,
    required this.firestore,
    required this.crashlytics,
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
        RepositoryProvider(
          create: (context) => CrashReportingRepository(
            crashlytics: crashlytics,
          ),
        ),
        RepositoryProvider(
          create: (context) => PaymentRepository(
            firestore: firestore,
          ),
        ),
      ],
      child: BlocProvider(
        create: (context) => AuthCubit(
          userRepository: context.read<UserRepository>(),
        )..init(),
        child: MaterialApp(
          title: "Profile Page",
          theme: AppTheme.lightTheme,
          home: BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) {
              switch (state.status) {
                case AuthStatus.loading:
                case AuthStatus.unauthenticated:
                case AuthStatus.failure:
                  return const WelcomePage();
                case AuthStatus.authenticated:
                  return const MainAppPage();
              }
            },
          ),
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}
