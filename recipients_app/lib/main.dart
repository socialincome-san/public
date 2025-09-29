import "package:app/core/helpers/custom_bloc_observer.dart";
import "package:app/data/datasource/demo/organization_demo_data_source.dart";
import "package:app/data/datasource/demo/payment_demo_data_source.dart";
import "package:app/data/datasource/demo/survey_demo_data_source.dart";
import "package:app/data/datasource/demo/user_demo_data_source.dart";
import "package:app/data/datasource/remote/organization_remote_data_source.dart";
import "package:app/data/datasource/remote/payment_remote_data_source.dart";
import "package:app/data/datasource/remote/survey_remote_data_source.dart";
import "package:app/data/datasource/remote/user_remote_data_source.dart";
//import "package:app/data/services/firebase_otp_service.dart";
import "package:app/data/services/twilio_otp_service.dart";
import "package:app/demo_manager.dart";
import "package:app/my_app.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_core/firebase_core.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_native_splash/flutter_native_splash.dart";
import "package:sentry_flutter/sentry_flutter.dart";

// Important: Why we have separate main file per flavor (main_stage.dart, main_prod.dart)?
// This approach ensures that only the required Firebase configuration file is bundled, making it a secure and efficient solution for managing multiple flavors.
// For more details see: https://codewithandrea.com/articles/flutter-firebase-multiple-flavors-flutterfire-cli/#option-2-use-multiple-entry-points

// Async for Firebase
Future<void> runMainApp(FirebaseOptions firebaseOptions) async {
  final widgetsBinding = SentryWidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  SystemChrome.setPreferredOrientations(
    [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown],
  );

  const appFlavor = String.fromEnvironment("FLUTTER_APP_FLAVOR");
  if (appFlavor.isEmpty) {
    throw Exception("Missing app flavor setting");
  }

  await Firebase.initializeApp(options: firebaseOptions);
  await FirebaseAppCheck.instance.activate(
    androidProvider: kDebugMode ? AndroidProvider.debug : AndroidProvider.playIntegrity,
    appleProvider: kDebugMode ? AppleProvider.debug : AppleProvider.appAttest,
  );

  final firestore = FirebaseFirestore.instance;
  final firebaseAuth = FirebaseAuth.instance;
  final messaging = FirebaseMessaging.instance;
  final demoManager = DemoManager();

  //final authService = FirebaseOtpService(firebaseAuth: firebaseAuth, demoManager: demoManager,);
  final authService = TwilioOtpService(
    firebaseAuth: firebaseAuth,
    demoManager: demoManager,
    accountSid: const String.fromEnvironment("TWILIO_ACCOUNT_SID"),
    authToken: const String.fromEnvironment("TWILIO_AUTH_TOKEN"),
    twilioNumber: const String.fromEnvironment("TWILIO_NUMBER"),
    serviceId: const String.fromEnvironment("TWILIO_SERVICE_SID"),
  );

  final userRemoteDataSource = UserRemoteDataSource(
    firestore: firestore,
    firebaseAuth: firebaseAuth,
  );
  final userDemoDataSource = UserDemoDataSource();

  final paymentRemoteDataSource = PaymentRemoteDataSource(firestore: firestore);
  final paymentDemoDataSource = PaymentDemoDataSource();

  final surveyRemoteDataSource = SurveyRemoteDataSource(firestore: firestore);
  final surveyDemoDataSource = SurveyDemoDataSource();

  final organizationRemoteDataSource = OrganizationRemoteDataSource(firestore: firestore);
  final organizationDemoDataSource = OrganizationDemoDataSource();

  Bloc.observer = CustomBlocObserver();

  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment("SENTRY_URL");
      options.tracesSampleRate = 1.0;
      options.profilesSampleRate = 1.0;
      options.environment = appFlavor;
    },
    appRunner: () => runApp(
      MyApp(
        messaging: messaging,
        demoManager: demoManager,
        userRemoteDataSource: userRemoteDataSource,
        userDemoDataSource: userDemoDataSource,
        paymentRemoteDataSource: paymentRemoteDataSource,
        paymentDemoDataSource: paymentDemoDataSource,
        surveyRemoteDataSource: surveyRemoteDataSource,
        surveyDemoDataSource: surveyDemoDataSource,
        organizationRemoteDataSource: organizationRemoteDataSource,
        organizationDemoDataSource: organizationDemoDataSource,
        authService: authService,
      ),
    ),
  );
}
