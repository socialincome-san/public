import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/connectivity/connectivity_cubit.dart";
import "package:app/core/cubits/payment/payouts_cubit.dart";
import "package:app/core/cubits/settings/settings_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/database/app_database.dart";
import "package:app/data/database/app_database_cleaner.dart";
import "package:app/data/models/app_version_info.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/data/services/auth_service.dart";
import "package:app/data/services/firebase_remote_config_service.dart";
import "package:app/data/services/update_queue_service.dart";
import "package:app/demo_manager.dart";
import "package:app/kri_intl.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/ui/navigation/app_navigation_keys.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/terms_and_conditions_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:app/view/widgets/app_update_check_widget.dart";
import "package:app/view/widgets/offline_banner.dart";
import "package:app/view/widgets/queue_event_listener.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:flutter_native_splash/flutter_native_splash.dart";

class MyApp extends StatelessWidget {
  final FirebaseMessaging messaging;
  final DemoManager demoManager;
  final AppDatabase appDatabase;
  final AppDatabaseCleaner appDatabaseCleaner;
  final ConnectivityCubit connectivityCubit;

  final CrashReportingRepository crashReportingRepository;

  final UserRepository userRepository;
  final PaymentRepository paymentRepository;
  final SurveyRepository surveyRepository;

  final UpdateQueueService updateQueueService;
  final AuthService authService;
  final FirebaseRemoteConfigService firebaseRemoteConfigService;

  final AppVersionInfo? appVersionInfo;

  const MyApp({
    super.key,
    required this.messaging,
    required this.demoManager,
    required this.appDatabase,
    required this.appDatabaseCleaner,
    required this.connectivityCubit,
    required this.userRepository,
    required this.paymentRepository,
    required this.surveyRepository,
    required this.updateQueueService,
    required this.authService,
    required this.firebaseRemoteConfigService,
    required this.crashReportingRepository,
    required this.appVersionInfo,
  });

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<DemoManager>(create: (context) => demoManager),
        RepositoryProvider<AppDatabase>.value(value: appDatabase),
        RepositoryProvider(create: (context) => MessagingRepository(messaging: messaging)),
        RepositoryProvider<UserRepository>.value(value: userRepository),
        RepositoryProvider.value(value: crashReportingRepository),
        RepositoryProvider<PaymentRepository>.value(value: paymentRepository),
        RepositoryProvider<SurveyRepository>.value(value: surveyRepository),
        RepositoryProvider<UpdateQueueService>.value(value: updateQueueService),
        RepositoryProvider<AuthService>.value(value: authService),
        RepositoryProvider<FirebaseRemoteConfigService>.value(
          value: firebaseRemoteConfigService,
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthCubit(
              crashReportingRepository: context.read<CrashReportingRepository>(),
              userRepository: context.read<UserRepository>(),
              authService: context.read<AuthService>(),
              appDatabaseCleaner: appDatabaseCleaner,
            )..init(),
          ),
          BlocProvider(
            create: (context) => SettingsCubit(
              defaultLocale: const Locale("en", "US"),
              messagingRepository: context.read<MessagingRepository>(),
              crashReportingRepository: context.read<CrashReportingRepository>(),
            )..initMessaging(),
          ),
          BlocProvider<ConnectivityCubit>.value(value: connectivityCubit),
          BlocProvider(
            create: (context) => PayoutsCubit(
              recipient: context.read<AuthCubit>().state.recipient!,
              paymentRepository: context.read<PaymentRepository>(),
              crashReportingRepository: context.read<CrashReportingRepository>(),
            )..loadPayments(),
          ),
        ],
        child: QueueEventListener(
          queueService: updateQueueService,
          child: _App(
            appVersionInfo: appVersionInfo,
          ),
        ),
      ),
    );
  }
}

class _App extends StatelessWidget {
  final AppVersionInfo? appVersionInfo;

  const _App({required this.appVersionInfo});

  @override
  Widget build(BuildContext context) {
    final currentLocale = context.watch<SettingsCubit>().state.locale;

    return MaterialApp(
      title: "Social Income",
      theme: AppTheme.lightTheme,
      locale: currentLocale,
      navigatorKey: rootNavigatorKey,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        KriMaterialLocalizations.delegate,
        KriCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale("en", "US"), Locale("kri")],
      builder: (context, child) {
        return OfflineBanner(child: child ?? const SizedBox.shrink());
      },
      home: AppUpdateCheckWidget(
        appVersionInfo: appVersionInfo,
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state.status == AuthStatus.authenticatedWithoutRecipient) {
              // Sign out the user to clean up auth state
              context.read<AuthService>().signOut();
              // Show error message to user
              FlushbarHelper.showFlushbar(
                context,
                message: context.l10n.recipientNotFound,
                type: FlushbarType.error,
              );
            }
            if (state.status == AuthStatus.authenticated) {
              // change language to the user's preferred language
              final selectedLanguage = state.recipient?.contact.language;

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
                  case AuthStatus.authenticatedWithoutRecipient:
                  case AuthStatus.failure:
                    FlutterNativeSplash.remove();
                    return const WelcomePage();
                  case AuthStatus.authenticated:
                  case AuthStatus.updateRecipientFailure:
                  case AuthStatus.updateRecipientSuccess:
                  case AuthStatus.updateRecipientQueued:
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
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
