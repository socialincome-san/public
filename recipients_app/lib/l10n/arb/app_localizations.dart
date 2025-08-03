import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_kri.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'arb/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('kri'),
  ];

  /// No description provided for @profileUpdateSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get profileUpdateSuccess;

  /// No description provided for @profileUpdateError.
  ///
  /// In en, this message translates to:
  /// **'Failed to update profile. Please try again or contact our support'**
  String get profileUpdateError;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @personal.
  ///
  /// In en, this message translates to:
  /// **'Personal'**
  String get personal;

  /// No description provided for @name.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get name;

  /// No description provided for @nameError.
  ///
  /// In en, this message translates to:
  /// **'Please enter your name'**
  String get nameError;

  /// No description provided for @surname.
  ///
  /// In en, this message translates to:
  /// **'Surname'**
  String get surname;

  /// No description provided for @surnameError.
  ///
  /// In en, this message translates to:
  /// **'Please enter your surname'**
  String get surnameError;

  /// No description provided for @callingName.
  ///
  /// In en, this message translates to:
  /// **'Calling Name'**
  String get callingName;

  /// No description provided for @gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get gender;

  /// No description provided for @male.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get male;

  /// No description provided for @female.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get female;

  /// No description provided for @other.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get other;

  /// No description provided for @genderError.
  ///
  /// In en, this message translates to:
  /// **'Please select a gender'**
  String get genderError;

  /// No description provided for @dateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of Birth'**
  String get dateOfBirth;

  /// No description provided for @dateOfBirthError.
  ///
  /// In en, this message translates to:
  /// **'Please select a date of birth'**
  String get dateOfBirthError;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @krio.
  ///
  /// In en, this message translates to:
  /// **'Krio'**
  String get krio;

  /// No description provided for @languageError.
  ///
  /// In en, this message translates to:
  /// **'Please select a language'**
  String get languageError;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @paymentPhone.
  ///
  /// In en, this message translates to:
  /// **'Payment Phone'**
  String get paymentPhone;

  /// No description provided for @paymentNumber.
  ///
  /// In en, this message translates to:
  /// **'Payment Number'**
  String get paymentNumber;

  /// No description provided for @paymentNumberError.
  ///
  /// In en, this message translates to:
  /// **'Please enter your phone number'**
  String get paymentNumberError;

  /// No description provided for @paymentNumberError2.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid phone number. Only numbers are allowed'**
  String get paymentNumberError2;

  /// No description provided for @mobilePaymentProvider.
  ///
  /// In en, this message translates to:
  /// **'Mobile Payment Provider'**
  String get mobilePaymentProvider;

  /// No description provided for @paymentProviderError.
  ///
  /// In en, this message translates to:
  /// **'Please select a payment provider'**
  String get paymentProviderError;

  /// No description provided for @contactPhone.
  ///
  /// In en, this message translates to:
  /// **'Contact Phone'**
  String get contactPhone;

  /// No description provided for @contactNumber.
  ///
  /// In en, this message translates to:
  /// **'Contact Number'**
  String get contactNumber;

  /// No description provided for @contactNumberError.
  ///
  /// In en, this message translates to:
  /// **'Please enter your contact phone number'**
  String get contactNumberError;

  /// No description provided for @contactNumberError2.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid phone number. Only numbers are allowed'**
  String get contactNumberError2;

  /// No description provided for @inCaseOfDeathTitle.
  ///
  /// In en, this message translates to:
  /// **'⁠In Case of Death'**
  String get inCaseOfDeathTitle;

  /// No description provided for @inCaseOfDeathDescription.
  ///
  /// In en, this message translates to:
  /// **'Who should be the recipient of your Social Income payments if you pass away during the program?'**
  String get inCaseOfDeathDescription;

  /// No description provided for @successorName.
  ///
  /// In en, this message translates to:
  /// **'Successor Name'**
  String get successorName;

  /// No description provided for @support.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get support;

  /// No description provided for @supportInfo.
  ///
  /// In en, this message translates to:
  /// **'In case you have any questions or problems, please contact us.'**
  String get supportInfo;

  /// No description provided for @getInTouch.
  ///
  /// In en, this message translates to:
  /// **'Get in touch with us'**
  String get getInTouch;

  /// No description provided for @account.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get account;

  /// No description provided for @accountInfo.
  ///
  /// In en, this message translates to:
  /// **'In case you want to delete your account, please contact us.'**
  String get accountInfo;

  /// No description provided for @signOut.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get signOut;

  /// No description provided for @dashboardUp2Date.
  ///
  /// In en, this message translates to:
  /// **'You are up to date.\nNo news today.'**
  String get dashboardUp2Date;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @underInvestigation.
  ///
  /// In en, this message translates to:
  /// **'Currently under investigation'**
  String get underInvestigation;

  /// No description provided for @didYouGetSocialIncome.
  ///
  /// In en, this message translates to:
  /// **'Did you get your Social Income?'**
  String get didYouGetSocialIncome;

  /// No description provided for @resolved.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get resolved;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @nextPayment.
  ///
  /// In en, this message translates to:
  /// **'Next Payment'**
  String get nextPayment;

  /// No description provided for @review.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get review;

  /// No description provided for @payments.
  ///
  /// In en, this message translates to:
  /// **'Payments'**
  String get payments;

  /// No description provided for @orangeMoneyNumber.
  ///
  /// In en, this message translates to:
  /// **'Orange Money Number'**
  String get orangeMoneyNumber;

  /// No description provided for @pastPayments.
  ///
  /// In en, this message translates to:
  /// **'Past Payments'**
  String get pastPayments;

  /// No description provided for @futurePayments.
  ///
  /// In en, this message translates to:
  /// **'Future Payments'**
  String get futurePayments;

  /// No description provided for @paymentsSuspended.
  ///
  /// In en, this message translates to:
  /// **'Suspended'**
  String get paymentsSuspended;

  /// No description provided for @paymentsEmptyList.
  ///
  /// In en, this message translates to:
  /// **'No payments.'**
  String get paymentsEmptyList;

  /// No description provided for @survey.
  ///
  /// In en, this message translates to:
  /// **'Survey'**
  String get survey;

  /// No description provided for @createAccountInfo.
  ///
  /// In en, this message translates to:
  /// **'By creating an account, you agree with our '**
  String get createAccountInfo;

  /// No description provided for @privacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// No description provided for @privacyPolicyError.
  ///
  /// In en, this message translates to:
  /// **'Can\'t open privacy policy right now. Copied website address to the clipboard.'**
  String get privacyPolicyError;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @recommendingOrganization.
  ///
  /// In en, this message translates to:
  /// **'Recommending Organization'**
  String get recommendingOrganization;

  /// No description provided for @call.
  ///
  /// In en, this message translates to:
  /// **'Call'**
  String get call;

  /// No description provided for @supportTeam.
  ///
  /// In en, this message translates to:
  /// **'Support Team'**
  String get supportTeam;

  /// No description provided for @phone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @whatsappError.
  ///
  /// In en, this message translates to:
  /// **'WhatsApp not installed'**
  String get whatsappError;

  /// No description provided for @paymentsConfirmedCount.
  ///
  /// In en, this message translates to:
  /// **'payments received'**
  String get paymentsConfirmedCount;

  /// No description provided for @paymentsInReview.
  ///
  /// In en, this message translates to:
  /// **'Did you receive the last payment?'**
  String get paymentsInReview;

  /// No description provided for @paymentsInReviewOne.
  ///
  /// In en, this message translates to:
  /// **'You have 1 payment to review. Did you receive it?'**
  String get paymentsInReviewOne;

  /// No description provided for @paymentsInReviewTwo.
  ///
  /// In en, this message translates to:
  /// **'You have 2 payments to review in a row'**
  String get paymentsInReviewTwo;

  /// No description provided for @paymentsInReviewMany.
  ///
  /// In en, this message translates to:
  /// **'You have {count} payments to review. Did you receive them?'**
  String paymentsInReviewMany(int count);

  /// No description provided for @paymentsOverview.
  ///
  /// In en, this message translates to:
  /// **'Payments Overview'**
  String get paymentsOverview;

  /// No description provided for @paymentsSuspendedTwoUnreviewed.
  ///
  /// In en, this message translates to:
  /// **'2 unreviewed payments in a row. Suspended payments.'**
  String get paymentsSuspendedTwoUnreviewed;

  /// No description provided for @amount.
  ///
  /// In en, this message translates to:
  /// **'Amount'**
  String get amount;

  /// No description provided for @nextMonth.
  ///
  /// In en, this message translates to:
  /// **'Next month'**
  String get nextMonth;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @oneDay.
  ///
  /// In en, this message translates to:
  /// **'1 day'**
  String get oneDay;

  /// No description provided for @daysAgo.
  ///
  /// In en, this message translates to:
  /// **'{number} days ago'**
  String daysAgo(int number);

  /// No description provided for @inDays.
  ///
  /// In en, this message translates to:
  /// **'{number} days'**
  String inDays(int number);

  /// No description provided for @day.
  ///
  /// In en, this message translates to:
  /// **'day'**
  String get day;

  /// No description provided for @days.
  ///
  /// In en, this message translates to:
  /// **'days'**
  String get days;

  /// No description provided for @myPayments.
  ///
  /// In en, this message translates to:
  /// **'My Payments'**
  String get myPayments;

  /// No description provided for @contestPayment.
  ///
  /// In en, this message translates to:
  /// **'Contest Payment'**
  String get contestPayment;

  /// No description provided for @contestPaymentInfo.
  ///
  /// In en, this message translates to:
  /// **'A payment has not reached you. What happened?'**
  String get contestPaymentInfo;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @describeWhatHappened.
  ///
  /// In en, this message translates to:
  /// **'Describe what happened'**
  String get describeWhatHappened;

  /// No description provided for @startSurvey.
  ///
  /// In en, this message translates to:
  /// **'Start Survey'**
  String get startSurvey;

  /// No description provided for @surveyStatusAnswered.
  ///
  /// In en, this message translates to:
  /// **'Answered'**
  String get surveyStatusAnswered;

  /// No description provided for @surveyStatusMissed.
  ///
  /// In en, this message translates to:
  /// **'Missed Survey'**
  String get surveyStatusMissed;

  /// No description provided for @surveyDaysToAnswer.
  ///
  /// In en, this message translates to:
  /// **'You have {daysOverdue} {daysText} to answer'**
  String surveyDaysToAnswer(int daysOverdue, String daysText);

  /// No description provided for @overdue.
  ///
  /// In en, this message translates to:
  /// **'overdue'**
  String get overdue;

  /// No description provided for @surveyDaysLeft.
  ///
  /// In en, this message translates to:
  /// **'You have {days} {dayText} to answer'**
  String surveyDaysLeft(int days, String dayText);

  /// No description provided for @surveyCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Survey'**
  String get surveyCardTitle;

  /// No description provided for @surveyCardInfo.
  ///
  /// In en, this message translates to:
  /// **'Please take 5 minutes to answer questions and help to improve Social Income'**
  String get surveyCardInfo;

  /// No description provided for @verification.
  ///
  /// In en, this message translates to:
  /// **'Verification'**
  String get verification;

  /// No description provided for @verificationSent.
  ///
  /// In en, this message translates to:
  /// **'We sent you a verification code to {phoneNumber}'**
  String verificationSent(String phoneNumber);

  /// No description provided for @resendVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Resend verification code'**
  String get resendVerificationCode;

  /// No description provided for @yourMobilePhone.
  ///
  /// In en, this message translates to:
  /// **'Your mobile phone'**
  String get yourMobilePhone;

  /// No description provided for @continueText.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueText;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get phoneNumber;

  /// No description provided for @appVersion.
  ///
  /// In en, this message translates to:
  /// **'App version:'**
  String get appVersion;

  /// No description provided for @surveysTitle.
  ///
  /// In en, this message translates to:
  /// **'Surveys'**
  String get surveysTitle;

  /// No description provided for @surveysEmpty.
  ///
  /// In en, this message translates to:
  /// **'No surveys.'**
  String get surveysEmpty;

  /// No description provided for @surveyMissed.
  ///
  /// In en, this message translates to:
  /// **'Missed'**
  String get surveyMissed;

  /// No description provided for @surveyDue.
  ///
  /// In en, this message translates to:
  /// **'Due'**
  String get surveyDue;

  /// No description provided for @surveyCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get surveyCompleted;

  /// No description provided for @surveyUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get surveyUpcoming;

  /// No description provided for @surveyInProgress.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get surveyInProgress;

  /// No description provided for @overview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get overview;

  /// No description provided for @completedSurveysCount.
  ///
  /// In en, this message translates to:
  /// **'{done}/{all} completed'**
  String completedSurveysCount(int done, int all);

  /// No description provided for @mySurveysTitle.
  ///
  /// In en, this message translates to:
  /// **'My surveys'**
  String get mySurveysTitle;

  /// No description provided for @invalidPhoneNumberError.
  ///
  /// In en, this message translates to:
  /// **'Invalid phone number. Please check your phone number and try again.'**
  String get invalidPhoneNumberError;

  /// No description provided for @invalidVerificationCodeError.
  ///
  /// In en, this message translates to:
  /// **'Invalid verification code. Please check provided SMS code and try again.'**
  String get invalidVerificationCodeError;

  /// No description provided for @userDisabledError.
  ///
  /// In en, this message translates to:
  /// **'Your user account was disabled. Contact with us if you need more information.'**
  String get userDisabledError;

  /// No description provided for @invalidCredentialError.
  ///
  /// In en, this message translates to:
  /// **'Provided phone number or verification code are no longer valid. Please try again.'**
  String get invalidCredentialError;

  /// No description provided for @adminOnlyOperation.
  ///
  /// In en, this message translates to:
  /// **'This operation is only allowed for admin users'**
  String get adminOnlyOperation;

  /// No description provided for @argumentError.
  ///
  /// In en, this message translates to:
  /// **'Invalid argument provided'**
  String get argumentError;

  /// No description provided for @appNotAuthorized.
  ///
  /// In en, this message translates to:
  /// **'App not authorized'**
  String get appNotAuthorized;

  /// No description provided for @appNotInstalled.
  ///
  /// In en, this message translates to:
  /// **'App not installed'**
  String get appNotInstalled;

  /// No description provided for @captchaCheckFailed.
  ///
  /// In en, this message translates to:
  /// **'CAPTCHA check failed'**
  String get captchaCheckFailed;

  /// No description provided for @codeExpired.
  ///
  /// In en, this message translates to:
  /// **'Code expired'**
  String get codeExpired;

  /// No description provided for @cordovaNotReady.
  ///
  /// In en, this message translates to:
  /// **'Cordova is not ready'**
  String get cordovaNotReady;

  /// No description provided for @corsUnsupported.
  ///
  /// In en, this message translates to:
  /// **'CORS is unsupported'**
  String get corsUnsupported;

  /// No description provided for @credentialAlreadyInUse.
  ///
  /// In en, this message translates to:
  /// **'Credential already in use'**
  String get credentialAlreadyInUse;

  /// No description provided for @credentialMismatch.
  ///
  /// In en, this message translates to:
  /// **'Credential mismatch'**
  String get credentialMismatch;

  /// No description provided for @credentialTooOldLoginAgain.
  ///
  /// In en, this message translates to:
  /// **'Credential too old, please login again'**
  String get credentialTooOldLoginAgain;

  /// No description provided for @dependentSdkInitBeforeAuth.
  ///
  /// In en, this message translates to:
  /// **'Dependent SDK initialized before auth'**
  String get dependentSdkInitBeforeAuth;

  /// No description provided for @dynamicLinkNotActivated.
  ///
  /// In en, this message translates to:
  /// **'Dynamic link not activated'**
  String get dynamicLinkNotActivated;

  /// No description provided for @emailChangeNeedsVerification.
  ///
  /// In en, this message translates to:
  /// **'Email change needs verification'**
  String get emailChangeNeedsVerification;

  /// No description provided for @emailExists.
  ///
  /// In en, this message translates to:
  /// **'Email already exists'**
  String get emailExists;

  /// No description provided for @emulatorConfigFailed.
  ///
  /// In en, this message translates to:
  /// **'Emulator configuration failed'**
  String get emulatorConfigFailed;

  /// No description provided for @expiredOobCode.
  ///
  /// In en, this message translates to:
  /// **'Expired action code'**
  String get expiredOobCode;

  /// No description provided for @expiredPopupRequest.
  ///
  /// In en, this message translates to:
  /// **'Expired popup request'**
  String get expiredPopupRequest;

  /// No description provided for @internalError.
  ///
  /// In en, this message translates to:
  /// **'Internal error'**
  String get internalError;

  /// No description provided for @invalidApiKey.
  ///
  /// In en, this message translates to:
  /// **'Invalid API key'**
  String get invalidApiKey;

  /// No description provided for @invalidAppCredential.
  ///
  /// In en, this message translates to:
  /// **'Invalid app credential'**
  String get invalidAppCredential;

  /// No description provided for @invalidAppId.
  ///
  /// In en, this message translates to:
  /// **'Invalid app ID'**
  String get invalidAppId;

  /// No description provided for @invalidAuth.
  ///
  /// In en, this message translates to:
  /// **'Invalid user token'**
  String get invalidAuth;

  /// No description provided for @invalidAuthEvent.
  ///
  /// In en, this message translates to:
  /// **'Invalid auth event'**
  String get invalidAuthEvent;

  /// No description provided for @invalidCertHash.
  ///
  /// In en, this message translates to:
  /// **'Invalid cert hash'**
  String get invalidCertHash;

  /// No description provided for @invalidCode.
  ///
  /// In en, this message translates to:
  /// **'Invalid verification code'**
  String get invalidCode;

  /// No description provided for @invalidContinueUri.
  ///
  /// In en, this message translates to:
  /// **'Invalid resource'**
  String get invalidContinueUri;

  /// No description provided for @invalidCordovaConfiguration.
  ///
  /// In en, this message translates to:
  /// **'Invalid Cordova configuration'**
  String get invalidCordovaConfiguration;

  /// No description provided for @invalidCustomToken.
  ///
  /// In en, this message translates to:
  /// **'Invalid custom token'**
  String get invalidCustomToken;

  /// No description provided for @invalidDynamicLinkDomain.
  ///
  /// In en, this message translates to:
  /// **'Invalid dynamic link domain'**
  String get invalidDynamicLinkDomain;

  /// No description provided for @invalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Invalid email'**
  String get invalidEmail;

  /// No description provided for @invalidEmulatorScheme.
  ///
  /// In en, this message translates to:
  /// **'Invalid emulator scheme'**
  String get invalidEmulatorScheme;

  /// No description provided for @invalidIdpResponse.
  ///
  /// In en, this message translates to:
  /// **'Invalid credential'**
  String get invalidIdpResponse;

  /// No description provided for @invalidMessagePayload.
  ///
  /// In en, this message translates to:
  /// **'Invalid message payload'**
  String get invalidMessagePayload;

  /// No description provided for @invalidMfaSession.
  ///
  /// In en, this message translates to:
  /// **'Invalid multi-factor session'**
  String get invalidMfaSession;

  /// No description provided for @invalidOauthClientId.
  ///
  /// In en, this message translates to:
  /// **'Invalid OAuth client ID'**
  String get invalidOauthClientId;

  /// No description provided for @invalidOauthProvider.
  ///
  /// In en, this message translates to:
  /// **'Invalid OAuth provider'**
  String get invalidOauthProvider;

  /// No description provided for @invalidOobCode.
  ///
  /// In en, this message translates to:
  /// **'Invalid action code'**
  String get invalidOobCode;

  /// No description provided for @invalidOrigin.
  ///
  /// In en, this message translates to:
  /// **'Unauthorized domain'**
  String get invalidOrigin;

  /// No description provided for @invalidPassword.
  ///
  /// In en, this message translates to:
  /// **'Wrong password'**
  String get invalidPassword;

  /// No description provided for @invalidPersistence.
  ///
  /// In en, this message translates to:
  /// **'Invalid persistence type'**
  String get invalidPersistence;

  /// No description provided for @invalidProviderId.
  ///
  /// In en, this message translates to:
  /// **'Invalid provider ID'**
  String get invalidProviderId;

  /// No description provided for @invalidRecipientEmail.
  ///
  /// In en, this message translates to:
  /// **'Invalid recipient email'**
  String get invalidRecipientEmail;

  /// No description provided for @invalidSender.
  ///
  /// In en, this message translates to:
  /// **'Invalid sender'**
  String get invalidSender;

  /// No description provided for @invalidSessionInfo.
  ///
  /// In en, this message translates to:
  /// **'Invalid verification ID'**
  String get invalidSessionInfo;

  /// No description provided for @invalidTenantId.
  ///
  /// In en, this message translates to:
  /// **'Invalid tenant ID'**
  String get invalidTenantId;

  /// No description provided for @mfaInfoNotFound.
  ///
  /// In en, this message translates to:
  /// **'Multi-factor info not found'**
  String get mfaInfoNotFound;

  /// No description provided for @mfaRequired.
  ///
  /// In en, this message translates to:
  /// **'Multi-factor authentication required'**
  String get mfaRequired;

  /// No description provided for @missingAndroidPackageName.
  ///
  /// In en, this message translates to:
  /// **'Missing Android package name'**
  String get missingAndroidPackageName;

  /// No description provided for @missingAppCredential.
  ///
  /// In en, this message translates to:
  /// **'Missing app credential'**
  String get missingAppCredential;

  /// No description provided for @missingAuthDomain.
  ///
  /// In en, this message translates to:
  /// **'Auth domain configuration required'**
  String get missingAuthDomain;

  /// No description provided for @missingCode.
  ///
  /// In en, this message translates to:
  /// **'Missing verification code'**
  String get missingCode;

  /// No description provided for @missingContinueUri.
  ///
  /// In en, this message translates to:
  /// **'Missing ressource'**
  String get missingContinueUri;

  /// No description provided for @missingIframeStart.
  ///
  /// In en, this message translates to:
  /// **'Missing iframe start'**
  String get missingIframeStart;

  /// No description provided for @missingIosBundleId.
  ///
  /// In en, this message translates to:
  /// **'Missing iOS bundle ID'**
  String get missingIosBundleId;

  /// No description provided for @missingOrInvalidNonce.
  ///
  /// In en, this message translates to:
  /// **'Missing or invalid nonce'**
  String get missingOrInvalidNonce;

  /// No description provided for @missingMfaInfo.
  ///
  /// In en, this message translates to:
  /// **'Missing multi-factor info'**
  String get missingMfaInfo;

  /// No description provided for @missingMfaSession.
  ///
  /// In en, this message translates to:
  /// **'Missing multi-factor session'**
  String get missingMfaSession;

  /// No description provided for @missingPhoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Missing phone number'**
  String get missingPhoneNumber;

  /// No description provided for @missingSessionInfo.
  ///
  /// In en, this message translates to:
  /// **'Missing verification ID'**
  String get missingSessionInfo;

  /// No description provided for @moduleDestroyed.
  ///
  /// In en, this message translates to:
  /// **'App deleted'**
  String get moduleDestroyed;

  /// No description provided for @needConfirmation.
  ///
  /// In en, this message translates to:
  /// **'Account exists with different credential'**
  String get needConfirmation;

  /// No description provided for @networkRequestFailed.
  ///
  /// In en, this message translates to:
  /// **'Network request failed'**
  String get networkRequestFailed;

  /// No description provided for @nullUser.
  ///
  /// In en, this message translates to:
  /// **'Null user'**
  String get nullUser;

  /// No description provided for @noAuthEvent.
  ///
  /// In en, this message translates to:
  /// **'No auth event'**
  String get noAuthEvent;

  /// No description provided for @noSuchProvider.
  ///
  /// In en, this message translates to:
  /// **'No such provider'**
  String get noSuchProvider;

  /// No description provided for @operationNotAllowed.
  ///
  /// In en, this message translates to:
  /// **'Operation not allowed'**
  String get operationNotAllowed;

  /// No description provided for @operationNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Operation not supported in this environment'**
  String get operationNotSupported;

  /// No description provided for @popupBlocked.
  ///
  /// In en, this message translates to:
  /// **'Popup blocked'**
  String get popupBlocked;

  /// No description provided for @popupClosedByUser.
  ///
  /// In en, this message translates to:
  /// **'Popup closed by user'**
  String get popupClosedByUser;

  /// No description provided for @providerAlreadyLinked.
  ///
  /// In en, this message translates to:
  /// **'Provider already linked'**
  String get providerAlreadyLinked;

  /// No description provided for @quotaExceeded.
  ///
  /// In en, this message translates to:
  /// **'Quota exceeded'**
  String get quotaExceeded;

  /// No description provided for @redirectCancelledByUser.
  ///
  /// In en, this message translates to:
  /// **'Redirect cancelled by user'**
  String get redirectCancelledByUser;

  /// No description provided for @redirectOperationPending.
  ///
  /// In en, this message translates to:
  /// **'Redirect operation pending'**
  String get redirectOperationPending;

  /// No description provided for @rejectedCredential.
  ///
  /// In en, this message translates to:
  /// **'Rejected credential'**
  String get rejectedCredential;

  /// No description provided for @secondFactorAlreadyEnrolled.
  ///
  /// In en, this message translates to:
  /// **'Second factor already enrolled'**
  String get secondFactorAlreadyEnrolled;

  /// No description provided for @secondFactorLimitExceeded.
  ///
  /// In en, this message translates to:
  /// **'Maximum second factor count exceeded'**
  String get secondFactorLimitExceeded;

  /// No description provided for @tenantIdMismatch.
  ///
  /// In en, this message translates to:
  /// **'Tenant ID mismatch'**
  String get tenantIdMismatch;

  /// No description provided for @timeoutError.
  ///
  /// In en, this message translates to:
  /// **'Timeout'**
  String get timeoutError;

  /// No description provided for @tokenExpired.
  ///
  /// In en, this message translates to:
  /// **'User token expired'**
  String get tokenExpired;

  /// No description provided for @tooManyAttemptsTryLater.
  ///
  /// In en, this message translates to:
  /// **'Too many requests, try again later'**
  String get tooManyAttemptsTryLater;

  /// No description provided for @unauthorizedDomain.
  ///
  /// In en, this message translates to:
  /// **'Unauthorized domain for resource'**
  String get unauthorizedDomain;

  /// No description provided for @unsupportedFirstFactor.
  ///
  /// In en, this message translates to:
  /// **'Unsupported first factor'**
  String get unsupportedFirstFactor;

  /// No description provided for @unsupportedPersistence.
  ///
  /// In en, this message translates to:
  /// **'Unsupported persistence type'**
  String get unsupportedPersistence;

  /// No description provided for @unsupportedTenantOperation.
  ///
  /// In en, this message translates to:
  /// **'Unsupported tenant operation'**
  String get unsupportedTenantOperation;

  /// No description provided for @unverifiedEmail.
  ///
  /// In en, this message translates to:
  /// **'Unverified email'**
  String get unverifiedEmail;

  /// No description provided for @userCancelled.
  ///
  /// In en, this message translates to:
  /// **'User cancelled'**
  String get userCancelled;

  /// No description provided for @userDeleted.
  ///
  /// In en, this message translates to:
  /// **'User not found'**
  String get userDeleted;

  /// No description provided for @userMismatch.
  ///
  /// In en, this message translates to:
  /// **'User mismatch'**
  String get userMismatch;

  /// No description provided for @userSignedOut.
  ///
  /// In en, this message translates to:
  /// **'User signed out'**
  String get userSignedOut;

  /// No description provided for @weakPassword.
  ///
  /// In en, this message translates to:
  /// **'Weak password'**
  String get weakPassword;

  /// No description provided for @webStorageUnsupported.
  ///
  /// In en, this message translates to:
  /// **'Web storage unsupported'**
  String get webStorageUnsupported;

  /// No description provided for @alreadyInitialized.
  ///
  /// In en, this message translates to:
  /// **'Already initialized'**
  String get alreadyInitialized;

  /// No description provided for @recaptchaNotEnabled.
  ///
  /// In en, this message translates to:
  /// **'reCAPTCHA not enabled'**
  String get recaptchaNotEnabled;

  /// No description provided for @missingRecaptchaToken.
  ///
  /// In en, this message translates to:
  /// **'Missing reCAPTCHA token'**
  String get missingRecaptchaToken;

  /// No description provided for @invalidRecaptchaToken.
  ///
  /// In en, this message translates to:
  /// **'Invalid reCAPTCHA token'**
  String get invalidRecaptchaToken;

  /// No description provided for @invalidRecaptchaAction.
  ///
  /// In en, this message translates to:
  /// **'Invalid reCAPTCHA action'**
  String get invalidRecaptchaAction;

  /// No description provided for @missingClientType.
  ///
  /// In en, this message translates to:
  /// **'Missing client type'**
  String get missingClientType;

  /// No description provided for @missingRecaptchaVersion.
  ///
  /// In en, this message translates to:
  /// **'Missing reCAPTCHA version'**
  String get missingRecaptchaVersion;

  /// No description provided for @invalidRecaptchaVersion.
  ///
  /// In en, this message translates to:
  /// **'Invalid reCAPTCHA version'**
  String get invalidRecaptchaVersion;

  /// No description provided for @invalidReqType.
  ///
  /// In en, this message translates to:
  /// **'Invalid request type'**
  String get invalidReqType;

  /// No description provided for @errorEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get errorEmailInvalid;

  /// No description provided for @demoCta.
  ///
  /// In en, this message translates to:
  /// **'Demo'**
  String get demoCta;

  /// No description provided for @createAccountDemo.
  ///
  /// In en, this message translates to:
  /// **'Enter demo'**
  String get createAccountDemo;

  /// No description provided for @contestReason_phoneStolen.
  ///
  /// In en, this message translates to:
  /// **'Phone stolen'**
  String get contestReason_phoneStolen;

  /// No description provided for @contestReason_incorrectAmount.
  ///
  /// In en, this message translates to:
  /// **'Incorrect amount'**
  String get contestReason_incorrectAmount;

  /// No description provided for @contestReason_numberChanged.
  ///
  /// In en, this message translates to:
  /// **'Changed phone number'**
  String get contestReason_numberChanged;

  /// No description provided for @contestReason_otherReason.
  ///
  /// In en, this message translates to:
  /// **'Other reason'**
  String get contestReason_otherReason;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'kri'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'kri':
      return AppLocalizationsKri();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
