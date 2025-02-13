import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/settings/settings_cubit.dart";
import "package:app/data/datasource/demo/organization_demo_data_source.dart";
import "package:app/data/datasource/demo/payment_demo_data_source.dart";
import "package:app/data/datasource/demo/survey_demo_data_source.dart";
import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/remote/organization_remote_data_source.dart";
import "package:app/data/datasource/remote/payment_remote_data_source.dart";
import "package:app/data/datasource/remote/survey_remote_data_source.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/demo_manager.dart";
import "package:app/kri_intl.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/terms_and_conditions_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:flutter_native_splash/flutter_native_splash.dart";

class MyApp extends StatelessWidget {
  final FirebaseMessaging messaging;
  final DemoManager demoManager;

  final UserRemoteDataSource userRemoteDataSource;
  final UserDemoDataSource userDemoDataSource;

  final PaymentRemoteDataSource paymentRemoteDataSource;
  final PaymentDemoDataSource paymentDemoDataSource;

  final SurveyRemoteDataSource surveyRemoteDataSource;
  final SurveyDemoDataSource surveyDemoDataSource;

  final OrganizationRemoteDataSource organizationRemoteDataSource;
  final OrganizationDemoDataSource organizationDemoDataSource;

  const MyApp({
    super.key,
    required this.messaging,
    required this.demoManager,
    required this.userRemoteDataSource,
    required this.userDemoDataSource,
    required this.paymentRemoteDataSource,
    required this.paymentDemoDataSource,
    required this.surveyRemoteDataSource,
    required this.surveyDemoDataSource,
    required this.organizationRemoteDataSource,
    required this.organizationDemoDataSource,
  });

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<DemoManager>(
          create: (context) => demoManager,
        ),
        RepositoryProvider(
          create: (context) => MessagingRepository(
            messaging: messaging,
          ),
        ),
        RepositoryProvider(
          create: (context) => UserRepository(
            remoteDataSource: userRemoteDataSource,
            demoDataSource: userDemoDataSource,
            demoManager: demoManager,
          ),
        ),
        RepositoryProvider(
          create: (context) => const CrashReportingRepository(),
        ),
        RepositoryProvider(
          create: (context) => PaymentRepository(
            remoteDataSource: paymentRemoteDataSource,
            demoDataSource: paymentDemoDataSource,
            demoManager: demoManager,
          ),
        ),
        RepositoryProvider(
          create: (context) => SurveyRepository(
            remoteDataSource: surveyRemoteDataSource,
            demoDataSource: surveyDemoDataSource,
            demoManager: demoManager,
          ),
        ),
        RepositoryProvider(
          create: (context) => OrganizationRepository(
            remoteDataSource: organizationRemoteDataSource,
            demoDataSource: organizationDemoDataSource,
            demoManager: demoManager,
          ),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthCubit(
              crashReportingRepository: context.read<CrashReportingRepository>(),
              organizationRepository: context.read<OrganizationRepository>(),
              userRepository: context.read<UserRepository>(),
            )..init(),
          ),
          BlocProvider(
            create: (context) => SettingsCubit(
              defaultLocale: const Locale("en", "US"),
              messagingRepository: context.read<MessagingRepository>(),
              crashReportingRepository: context.read<CrashReportingRepository>(),
            )..initMessaging(),
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
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        KriMaterialLocalizations.delegate,
        KriCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale("en", "US"),
        Locale("kri"),
      ],
      home: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state.status == AuthStatus.authenticated) {
            // change language to the user's preferred language
            final selectedLanguage = state.recipient?.selectedLanguage;

            if (selectedLanguage != null) {
              context.read<SettingsCubit>().changeLanguage(selectedLanguage);
            }
          }
        },
        builder: (context, state) {
          return BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) {
              switch (state.status) {
                case AuthStatus.loading:
                  return const SizedBox.shrink();
                case AuthStatus.unauthenticated:
                case AuthStatus.failure:
                  FlutterNativeSplash.remove();
                  return const WelcomePage();
                case AuthStatus.authenticated:
                case AuthStatus.updateRecipientFailure:
                case AuthStatus.updateRecipientSuccess:
                case AuthStatus.updatingRecipient:
                  FlutterNativeSplash.remove();
                  if (state.recipient?.termsAccepted == true) {
                    return const MainAppPage();
                  } else {
                    return const TermsAndConditionsPage();
                  }
              }
            },
          );
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
