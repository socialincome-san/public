import "package:app/core/helpers/custom_bloc_observer.dart";
import "package:app/my_app.dart";
import "package:cloud_firestore/cloud_firestore.dart";
import "package:firebase_app_check/firebase_app_check.dart";
import "package:firebase_auth/firebase_auth.dart";
import "package:firebase_core/firebase_core.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:flutter_native_splash/flutter_native_splash.dart";
import "package:sentry_flutter/sentry_flutter.dart";

//Async for Firebase
Future<void> main() async {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  SystemChrome.setPreferredOrientations(
    [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown],
  );

  const appFlavor = String.fromEnvironment("FLUTTER_APP_FLAVOR");
  if (appFlavor.isEmpty) {
    throw Exception("Missing app flavor setting");
  }

  await Firebase.initializeApp();
  await FirebaseAppCheck.instance.activate();

  final firestore = FirebaseFirestore.instance;
  final firebaseAuth = FirebaseAuth.instance;
  final messaging = FirebaseMessaging.instance;

  if (appFlavor == "dev") {
    firestore.useFirestoreEmulator("localhost", 8080);
    firebaseAuth.useAuthEmulator("localhost", 9099);
    firebaseAuth.setSettings(appVerificationDisabledForTesting: true);
  }

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
        firebaseAuth: firebaseAuth,
        firestore: firestore,
        messaging: messaging,
      ),
    ),
  );
}
