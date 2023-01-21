import "package:firebase_auth/firebase_auth.dart";
import "package:intl/intl.dart";

// Authentication service provides methods to register, verify phone number and sign in
class AuthService {
  static final AuthService _instance = AuthService._();

  // Implementation of Singleton pattern, so all Registration components use the same instance
  factory AuthService() {
    return _instance;
  }

  AuthService._();

  String createdAt() {
    // catching NoSuchMethodError due to logout process on page where this method is called
    try {
      final creationTime =
          FirebaseAuth.instance.currentUser?.metadata.creationTime;
      if (creationTime == null) {
        return "";
      }

      return DateFormat("dd.MM.yyyy").format(creationTime);
      // ignore: avoid_catching_errors
    } on NoSuchMethodError {
      return "";
    }
  }
}
