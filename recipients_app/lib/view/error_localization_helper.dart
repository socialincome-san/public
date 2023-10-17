import "package:firebase_auth/firebase_auth.dart";
import "package:flutter_gen/gen_l10n/app_localizations.dart";

String localizeExceptionMessage(Exception? ex, AppLocalizations localizations) {
  if (ex is FirebaseAuthException) {
    return switch (ex.code) {
      "invalid-verification-code" => localizations.invalidVerificationCodeError,
      "invalid-phone-number" => localizations.invalidPhoneNumberError,
      "invalid-credential" => localizations.invalidCredentialError,
      "user-disabled" => localizations.userDisabledError,
      _ => ex.toString(),
    };
  }

  return ex.toString();
}
