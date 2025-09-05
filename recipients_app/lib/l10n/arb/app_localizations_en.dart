// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get profileUpdateSuccess => 'Profile updated successfully';

  @override
  String get profileUpdateError =>
      'Failed to update profile. Please try again or contact our support';

  @override
  String get profile => 'Profile';

  @override
  String get personal => 'Personal';

  @override
  String get name => 'Name';

  @override
  String get nameError => 'Please enter your name';

  @override
  String get surname => 'Surname';

  @override
  String get surnameError => 'Please enter your surname';

  @override
  String get callingName => 'Calling Name';

  @override
  String get gender => 'Gender';

  @override
  String get male => 'Male';

  @override
  String get female => 'Female';

  @override
  String get other => 'Other';

  @override
  String get genderError => 'Please select a gender';

  @override
  String get dateOfBirth => 'Date of Birth';

  @override
  String get dateOfBirthError => 'Please select a date of birth';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get krio => 'Krio';

  @override
  String get languageError => 'Please select a language';

  @override
  String get email => 'Email';

  @override
  String get paymentPhone => 'Payment Phone';

  @override
  String get paymentNumber => 'Payment Number';

  @override
  String get paymentNumberError => 'Please enter your phone number';

  @override
  String get paymentNumberError2 =>
      'Please enter a valid phone number. Only numbers are allowed';

  @override
  String get mobilePaymentProvider => 'Mobile Payment Provider';

  @override
  String get paymentProviderError => 'Please select a payment provider';

  @override
  String get contactPhone => 'Contact Phone';

  @override
  String get contactNumber => 'Contact Number';

  @override
  String get contactNumberError => 'Please enter your contact phone number';

  @override
  String get contactNumberError2 =>
      'Please enter a valid phone number. Only numbers are allowed';

  @override
  String get inCaseOfDeathTitle => '⁠In Case of Death';

  @override
  String get inCaseOfDeathDescription =>
      'Who should be the recipient of your Social Income payments if you pass away during the program?';

  @override
  String get successorName => 'Successor Name';

  @override
  String get support => 'Support';

  @override
  String get supportInfo =>
      'In case you have any questions or problems, please contact us.';

  @override
  String get getInTouch => 'Get in touch with us';

  @override
  String get account => 'Account';

  @override
  String get accountInfo =>
      'In case you want to delete your account, please contact us.';

  @override
  String get signOut => 'Sign Out';

  @override
  String get dashboardUp2Date => 'You are up to date.\nNo news today.';

  @override
  String get edit => 'Edit';

  @override
  String get underInvestigation => 'Currently under investigation';

  @override
  String get didYouGetSocialIncome => 'Did you get your Social Income?';

  @override
  String get resolved => 'Resolved';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String get nextPayment => 'Next Payment';

  @override
  String get review => 'Review';

  @override
  String get payments => 'Payments';

  @override
  String get orangeMoneyNumber => 'Orange Money Number';

  @override
  String get pastPayments => 'Past Payments';

  @override
  String get futurePayments => 'Future Payments';

  @override
  String get paymentsSuspended => 'Suspended';

  @override
  String get paymentsEmptyList => 'No payments.';

  @override
  String get survey => 'Survey';

  @override
  String get createAccountInfo => 'By creating an account, you agree with our ';

  @override
  String get privacyPolicy => 'Privacy Policy';

  @override
  String get privacyPolicyError =>
      'Can\'t open privacy policy right now. Copied website address to the clipboard.';

  @override
  String get createAccount => 'Create Account';

  @override
  String get recommendingOrganization => 'Recommending Organization';

  @override
  String get call => 'Call';

  @override
  String get supportTeam => 'Support Team';

  @override
  String get phone => 'Phone';

  @override
  String get close => 'Close';

  @override
  String get whatsappError => 'WhatsApp not installed';

  @override
  String get paymentsConfirmedCount => 'payments received';

  @override
  String get paymentsInReview => 'Did you receive the last payment?';

  @override
  String get paymentsInReviewOne =>
      'You have 1 payment to review. Did you receive it?';

  @override
  String get paymentsInReviewTwo => 'You have 2 payments to review in a row';

  @override
  String paymentsInReviewMany(int count) {
    return 'You have $count payments to review. Did you receive them?';
  }

  @override
  String get paymentsOverview => 'Payments Overview';

  @override
  String get paymentsSuspendedTwoUnreviewed =>
      '2 unreviewed payments in a row. Suspended payments.';

  @override
  String get amount => 'Amount';

  @override
  String get nextMonth => 'Next month';

  @override
  String get today => 'Today';

  @override
  String get oneDay => '1 day';

  @override
  String daysAgo(int number) {
    return '$number days ago';
  }

  @override
  String inDays(int number) {
    return '$number days';
  }

  @override
  String get day => 'day';

  @override
  String get days => 'days';

  @override
  String get myPayments => 'My Payments';

  @override
  String get contestPayment => 'Contest Payment';

  @override
  String get contestPaymentInfo =>
      'A payment has not reached you. What happened?';

  @override
  String get submit => 'Submit';

  @override
  String get next => 'Next';

  @override
  String get describeWhatHappened => 'Describe what happened';

  @override
  String get startSurvey => 'Start Survey';

  @override
  String get surveyStatusAnswered => 'Answered';

  @override
  String get surveyStatusMissed => 'Missed Survey';

  @override
  String surveyDaysToAnswer(int daysOverdue, String daysText) {
    return 'You have $daysOverdue $daysText to answer';
  }

  @override
  String get overdue => 'overdue';

  @override
  String surveyDaysLeft(int days, String dayText) {
    return 'You have $days $dayText to answer';
  }

  @override
  String get surveyCardTitle => 'Survey';

  @override
  String get surveyCardInfo =>
      'Please take 5 minutes to answer questions and help to improve Social Income';

  @override
  String get verification => 'Verification';

  @override
  String verificationSent(String phoneNumber) {
    return 'We sent you a verification code to $phoneNumber';
  }

  @override
  String get resendVerificationCode => 'Resend verification code';

  @override
  String get yourMobilePhone => 'Your mobile phone';

  @override
  String get continueText => 'Continue';

  @override
  String get phoneNumber => 'Phone number';

  @override
  String get appVersion => 'App version:';

  @override
  String get surveysTitle => 'Surveys';

  @override
  String get surveysEmpty => 'No surveys.';

  @override
  String get surveyMissed => 'Missed';

  @override
  String get surveyDue => 'Due';

  @override
  String get surveyCompleted => 'Completed';

  @override
  String get surveyUpcoming => 'Upcoming';

  @override
  String get surveyInProgress => 'In Progress';

  @override
  String get overview => 'Overview';

  @override
  String completedSurveysCount(int done, int all) {
    return '$done/$all completed';
  }

  @override
  String get mySurveysTitle => 'My surveys';

  @override
  String get invalidPhoneNumberError =>
      'Invalid phone number. Please check your phone number and try again.';

  @override
  String get invalidVerificationCodeError =>
      'Invalid verification code. Please check provided SMS code and try again.';

  @override
  String get userDisabledError =>
      'Your user account was disabled. Contact with us if you need more information.';

  @override
  String get invalidCredentialError =>
      'Provided phone number or verification code are no longer valid. Please try again.';

  @override
  String get adminOnlyOperation =>
      'This operation is only allowed for admin users';

  @override
  String get argumentError => 'Invalid argument provided';

  @override
  String get appNotAuthorized => 'App not authorized';

  @override
  String get appNotInstalled => 'App not installed';

  @override
  String get captchaCheckFailed => 'CAPTCHA check failed';

  @override
  String get codeExpired => 'Code expired';

  @override
  String get cordovaNotReady => 'Cordova is not ready';

  @override
  String get corsUnsupported => 'CORS is unsupported';

  @override
  String get credentialAlreadyInUse => 'Credential already in use';

  @override
  String get credentialMismatch => 'Credential mismatch';

  @override
  String get credentialTooOldLoginAgain =>
      'Credential too old, please login again';

  @override
  String get dependentSdkInitBeforeAuth =>
      'Dependent SDK initialized before auth';

  @override
  String get dynamicLinkNotActivated => 'Dynamic link not activated';

  @override
  String get emailChangeNeedsVerification => 'Email change needs verification';

  @override
  String get emailExists => 'Email already exists';

  @override
  String get emulatorConfigFailed => 'Emulator configuration failed';

  @override
  String get expiredOobCode => 'Expired action code';

  @override
  String get expiredPopupRequest => 'Expired popup request';

  @override
  String get internalError => 'Internal error';

  @override
  String get invalidApiKey => 'Invalid API key';

  @override
  String get invalidAppCredential => 'Invalid app credential';

  @override
  String get invalidAppId => 'Invalid app ID';

  @override
  String get invalidAuth => 'Invalid user token';

  @override
  String get invalidAuthEvent => 'Invalid auth event';

  @override
  String get invalidCertHash => 'Invalid cert hash';

  @override
  String get invalidCode => 'Invalid verification code';

  @override
  String get invalidContinueUri => 'Invalid resource';

  @override
  String get invalidCordovaConfiguration => 'Invalid Cordova configuration';

  @override
  String get invalidCustomToken => 'Invalid custom token';

  @override
  String get invalidDynamicLinkDomain => 'Invalid dynamic link domain';

  @override
  String get invalidEmail => 'Invalid email';

  @override
  String get invalidEmulatorScheme => 'Invalid emulator scheme';

  @override
  String get invalidIdpResponse => 'Invalid credential';

  @override
  String get invalidMessagePayload => 'Invalid message payload';

  @override
  String get invalidMfaSession => 'Invalid multi-factor session';

  @override
  String get invalidOauthClientId => 'Invalid OAuth client ID';

  @override
  String get invalidOauthProvider => 'Invalid OAuth provider';

  @override
  String get invalidOobCode => 'Invalid action code';

  @override
  String get invalidOrigin => 'Unauthorized domain';

  @override
  String get invalidPassword => 'Wrong password';

  @override
  String get invalidPersistence => 'Invalid persistence type';

  @override
  String get invalidProviderId => 'Invalid provider ID';

  @override
  String get invalidRecipientEmail => 'Invalid recipient email';

  @override
  String get invalidSender => 'Invalid sender';

  @override
  String get invalidSessionInfo => 'Invalid verification ID';

  @override
  String get invalidTenantId => 'Invalid tenant ID';

  @override
  String get mfaInfoNotFound => 'Multi-factor info not found';

  @override
  String get mfaRequired => 'Multi-factor authentication required';

  @override
  String get missingAndroidPackageName => 'Missing Android package name';

  @override
  String get missingAppCredential => 'Missing app credential';

  @override
  String get missingAuthDomain => 'Auth domain configuration required';

  @override
  String get missingCode => 'Missing verification code';

  @override
  String get missingContinueUri => 'Missing ressource';

  @override
  String get missingIframeStart => 'Missing iframe start';

  @override
  String get missingIosBundleId => 'Missing iOS bundle ID';

  @override
  String get missingOrInvalidNonce => 'Missing or invalid nonce';

  @override
  String get missingMfaInfo => 'Missing multi-factor info';

  @override
  String get missingMfaSession => 'Missing multi-factor session';

  @override
  String get missingPhoneNumber => 'Missing phone number';

  @override
  String get missingSessionInfo => 'Missing verification ID';

  @override
  String get moduleDestroyed => 'App deleted';

  @override
  String get needConfirmation => 'Account exists with different credential';

  @override
  String get networkRequestFailed => 'Network request failed';

  @override
  String get nullUser => 'Null user';

  @override
  String get noAuthEvent => 'No auth event';

  @override
  String get noSuchProvider => 'No such provider';

  @override
  String get operationNotAllowed => 'Operation not allowed';

  @override
  String get operationNotSupported =>
      'Operation not supported in this environment';

  @override
  String get popupBlocked => 'Popup blocked';

  @override
  String get popupClosedByUser => 'Popup closed by user';

  @override
  String get providerAlreadyLinked => 'Provider already linked';

  @override
  String get quotaExceeded => 'Quota exceeded';

  @override
  String get redirectCancelledByUser => 'Redirect cancelled by user';

  @override
  String get redirectOperationPending => 'Redirect operation pending';

  @override
  String get rejectedCredential => 'Rejected credential';

  @override
  String get secondFactorAlreadyEnrolled => 'Second factor already enrolled';

  @override
  String get secondFactorLimitExceeded =>
      'Maximum second factor count exceeded';

  @override
  String get tenantIdMismatch => 'Tenant ID mismatch';

  @override
  String get timeoutError => 'Timeout';

  @override
  String get tokenExpired => 'User token expired';

  @override
  String get tooManyAttemptsTryLater => 'Too many requests, try again later';

  @override
  String get unauthorizedDomain => 'Unauthorized domain for resource';

  @override
  String get unsupportedFirstFactor => 'Unsupported first factor';

  @override
  String get unsupportedPersistence => 'Unsupported persistence type';

  @override
  String get unsupportedTenantOperation => 'Unsupported tenant operation';

  @override
  String get unverifiedEmail => 'Unverified email';

  @override
  String get userCancelled => 'User cancelled';

  @override
  String get userDeleted => 'User not found';

  @override
  String get userMismatch => 'User mismatch';

  @override
  String get userSignedOut => 'User signed out';

  @override
  String get weakPassword => 'Weak password';

  @override
  String get webStorageUnsupported => 'Web storage unsupported';

  @override
  String get alreadyInitialized => 'Already initialized';

  @override
  String get recaptchaNotEnabled => 'reCAPTCHA not enabled';

  @override
  String get missingRecaptchaToken => 'Missing reCAPTCHA token';

  @override
  String get invalidRecaptchaToken => 'Invalid reCAPTCHA token';

  @override
  String get invalidRecaptchaAction => 'Invalid reCAPTCHA action';

  @override
  String get missingClientType => 'Missing client type';

  @override
  String get missingRecaptchaVersion => 'Missing reCAPTCHA version';

  @override
  String get invalidRecaptchaVersion => 'Invalid reCAPTCHA version';

  @override
  String get invalidReqType => 'Invalid request type';

  @override
  String get errorEmailInvalid => 'Invalid email address';

  @override
  String get demoCta => 'Demo';

  @override
  String get createAccountDemo => 'Enter demo';

  @override
  String get contestReason_phoneStolen => 'Phone stolen';

  @override
  String get contestReason_incorrectAmount => 'Incorrect amount';

  @override
  String get contestReason_numberChanged => 'Changed phone number';

  @override
  String get contestReason_otherReason => 'Other reason';

  @override
  String get appUpdateButtonTitleLater => 'Later';

  @override
  String get appUpdateButtonTitleUpdateNow => 'Update now';

  @override
  String get appUpdateWidgetTitle => 'App Update Required';

  @override
  String get appUpdateWidgetMessage =>
      'Please update to continue using the app.';
}
