import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/settings/settings_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/kri_intl.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/terms_and_conditions_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_crashlytics/firebase_crashlytics.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:flutter_localizations/flutter_localizations.dart";

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
        RepositoryProvider(
          create: (context) => SurveyRepository(
            firestore: firestore,
          ),
        ),
        RepositoryProvider(
          create: (context) => OrganizationRepository(
            firestore: firestore,
          ),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthCubit(
              crashReportingRepository:
                  context.read<CrashReportingRepository>(),
              organizationRepository: context.read<OrganizationRepository>(),
              userRepository: context.read<UserRepository>(),
            )..init(),
          ),
          BlocProvider(
            create: (context) => SettingsCubit(
              defaultLocale: const Locale("kri"),
            ),
          ),
        ],
        child: const _App(),
      ),
    );
  }
}

class _App extends StatelessWidget {
  const _App();

  @override
  Widget build(BuildContext context) {
    final currentLocale = context.watch<SettingsCubit>().state.locale;

    return MaterialApp(
      title: "Social Income",
      theme: AppTheme.lightTheme,
      locale: currentLocale,
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        KriMaterialLocalizations.delegate,
        KriCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        const Locale("en", "US"),
        const Locale("kri"),
      ],
      home: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          switch (state.status) {
            case AuthStatus.loading:
            case AuthStatus.unauthenticated:
            case AuthStatus.failure:
              return const WelcomePage();
            case AuthStatus.authenticated:
            case AuthStatus.updateRecipientFailure:
            case AuthStatus.updateRecipientSuccess:
            case AuthStatus.updatingRecipient:
              if (state.recipient?.termsAccepted == true) {
                return const MainAppPage();
              } else {
                return const TermsAndConditionsPage();
              }
          }
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
