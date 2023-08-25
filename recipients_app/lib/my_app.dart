import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/data/repositories/repositories.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/pages/main_app_page.dart";
import "package:app/view/pages/terms_and_conditions_page.dart";
import "package:app/view/pages/welcome_page.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_crashlytics/firebase_crashlytics.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:i18next/i18next.dart";
import "package:intl/intl.dart";

import "krio_intl.dart";

class MyApp extends StatefulWidget {
  final FirebaseAuth firebaseAuth;
  final FirebaseFirestore firestore;
  final FirebaseCrashlytics crashlytics;

  final List<Locale> locales = const [
    Locale("en"),
    Locale("kri"),
  ];

  const MyApp({
    super.key,
    required this.firebaseAuth,
    required this.firestore,
    required this.crashlytics,
  });

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late Locale locale;

  @override
  void initState() {
    super.initState();

    locale = widget.locales.last;
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(
          create: (context) => UserRepository(
            firebaseAuth: widget.firebaseAuth,
            firestore: widget.firestore,
          ),
        ),
        RepositoryProvider(
          create: (context) => CrashReportingRepository(
            crashlytics: widget.crashlytics,
          ),
        ),
        RepositoryProvider(
          create: (context) => PaymentRepository(
            firestore: widget.firestore,
          ),
        ),
        RepositoryProvider(
          create: (context) => SurveyRepository(
            firestore: widget.firestore,
          ),
        ),
        RepositoryProvider(
          create: (context) => OrganizationRepository(
            firestore: widget.firestore,
          ),
        ),
      ],
      child: BlocProvider(
        create: (context) => AuthCubit(
          crashReportingRepository: context.read<CrashReportingRepository>(),
          organizationRepository: context.read<OrganizationRepository>(),
          userRepository: context.read<UserRepository>(),
        )..init(),
        child: MaterialApp(
          title: "Profile Page",
          theme: AppTheme.lightTheme,
          localizationsDelegates: [
            GlobalWidgetsLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
            KrioMaterialLocalizations.delegate,
            KrioCupertinoLocalizations.delegate,
            I18NextLocalizationDelegate(
              locales: widget.locales,
              dataSource: AssetBundleLocalizationDataSource(
                bundlePath: "assets/localizations",
              ),
              options: I18NextOptions(formats: formatters()),
            ),
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
          locale: locale,
          supportedLocales: widget.locales,
        ),
      ),
    );
  }

  void updateLocale(Locale newLocale) {
    setState(() {
      locale = newLocale;
    });
  }

  static Map<String, ValueFormatter> formatters() => {
        "uppercase": (value, format, locale, options) =>
            value?.toString().toUpperCase(),
        "lowercase": (value, format, locale, options) =>
            value?.toString().toLowerCase(),
        "datetime": (value, format, locale, options) {
          if (value is! DateTime) return value;
          var dateFormat = format.options["format"];
          dateFormat = dateFormat is String ? dateFormat : "dd/MM/yyyy";
          return DateFormat(dateFormat, locale.toString()).format(value);
        },
      };
}
