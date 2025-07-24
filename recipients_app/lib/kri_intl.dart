import "dart:async";

import "package:flutter/cupertino.dart";
import "package:flutter/foundation.dart";
import "package:flutter/material.dart";
import "package:flutter_localizations/flutter_localizations.dart";
import "package:intl/date_symbol_data_custom.dart" as date_symbol_data_custom;
import "package:intl/date_symbols.dart" as intl;
import "package:intl/intl.dart" as intl;

/// A custom set of date patterns for the `kri` locale.
///
/// These are not accurate and are just a clone of the date patterns for the
/// `no` locale to demonstrate how one would write and use custom date patterns.
// #docregion Date
const kriLocaleDatePatterns = {
  "d": "d",
  "E": "ccc",
  "EEEE": "cccc",
  "LLL": "LLL",
  "LLLL": "LLLL",
  "M": "L",
  "Md": "dd/MM",
  "MEd": "EEE, dd/MM",
  "MMM": "LLL",
  "MMMd": "d MMM",
  "MMMEd": "EEE, d MMM",
  "MMMM": "LLLL",
  "MMMMd": "d MMMM",
  "MMMMEEEEd": "EEEE, d MMMM",
  "QQQ": "QQQ",
  "QQQQ": "QQQQ",
  "y": "y",
  "yM": "MM/y",
  "yMd": "dd/MM/y",
  "yMEd": "EEE, dd/MM/y",
  "yMMM": "MMM y",
  "yMMMd": "d MMM y",
  "yMMMEd": "EEE, d MMM y",
  "yMMMM": "MMMM y",
  "yMMMMd": "d MMMM y",
  "yMMMMEEEEd": "EEEE, d MMMM y",
  "yQQQ": "QQQ y",
  "yQQQQ": "QQQQ y",
  "H": "HH",
  "Hm": "HH:mm",
  "Hms": "HH:mm:ss",
  "j": "h a",
  "jm": "h:mm a",
  "jms": "h:mm:ss a",
  "jmv": "h:mm a v",
  "jmz": "h:mm a z",
  "jz": "h a z",
  "m": "m",
  "ms": "mm:ss",
  "s": "s",
  "v": "v",
  "z": "z",
  "zzzz": "zzzz",
  "ZZZZ": "ZZZZ",
};

const enUsLocaleDataPatterns = {
  "d": "d",
  "E": "ccc",
  "EEEE": "cccc",
  "LLL": "LLL",
  "LLLL": "LLLL",
  "M": "L",
  "Md": "M/d",
  "MEd": "EEE, M/d",
  "MMM": "LLL",
  "MMMd": "MMM d",
  "MMMEd": "EEE, MMM d",
  "MMMM": "LLLL",
  "MMMMd": "MMMM d",
  "MMMMEEEEd": "EEEE, MMMM d",
  "QQQ": "QQQ",
  "QQQQ": "QQQQ",
  "y": "y",
  "yM": "M/y",
  "yMd": "M/d/y",
  "yMEd": "EEE, M/d/y",
  "yMMM": "MMM y",
  "yMMMd": "MMM d, y",
  "yMMMEd": "EEE, MMM d, y",
  "yMMMM": "MMMM y",
  "yMMMMd": "MMMM d, y",
  "yMMMMEEEEd": "EEEE, MMMM d, y",
  "yQQQ": "QQQ y",
  "yQQQQ": "QQQQ y",
  "H": "HH",
  "Hm": "HH:mm",
  "Hms": "HH:mm:ss",
  "j": "h a",
  "jm": "h:mm a",
  "jms": "h:mm:ss a",
  "jmv": "h:mm a v",
  "jmz": "h:mm a z",
  "jz": "h a z",
  "m": "m",
  "ms": "mm:ss",
  "s": "s",
  "v": "v",
  "z": "z",
  "zzzz": "zzzz",
  "ZZZZ": "ZZZZ",
};

/// A custom set of date symbols for the `kri` locale.
///
/// These are not accurate and are just a clone of the date symbols for the
/// `no` locale to demonstrate how one would write and use custom date symbols.
// #docregion Date2
const kriDateSymbols = {
  "NAME": "kri",
  "ERAS": <dynamic>[
    "BC",
    "AD",
  ],
  // #enddocregion Date2
  "ERANAMES": <dynamic>[
    "Before Christ",
    "Anno Domini",
  ],
  "NARROWMONTHS": <dynamic>[
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ],
  "STANDALONENARROWMONTHS": <dynamic>[
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ],
  "MONTHS": <dynamic>[
    "Jɛnyuari",
    "Fɛbyuari",
    "Mach",
    "Epril",
    "Me",
    "Jun",
    "Julay",
    "Ɔgɔst",
    "Sɛptɛmba",
    "Ɔktoba",
    "Novɛmba",
    "Disɛmba",
  ],
  "STANDALONEMONTHS": <dynamic>[
    "Jɛnyuari",
    "Fɛbyuari",
    "Mach",
    "Epril",
    "Me",
    "Jun",
    "Julay",
    "Ɔgɔst",
    "Sɛptɛmba",
    "Ɔktoba",
    "Novɛmba",
    "Disɛmba",
  ],
  "SHORTMONTHS": <dynamic>[
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  "STANDALONESHORTMONTHS": <dynamic>[
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  "WEEKDAYS": <dynamic>[
    "Sɔnde",
    "Mɔnde",
    "Tyusde",
    "Wɛnsde",
    "Tɔsde",
    "Frayde",
    "Satide",
  ],
  "STANDALONEWEEKDAYS": <dynamic>[
    "Sɔnde",
    "Mɔnde",
    "Tyusde",
    "Wɛnsde",
    "Tɔsde",
    "Frayde",
    "Satide",
  ],
  "SHORTWEEKDAYS": <dynamic>[
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ],
  "STANDALONESHORTWEEKDAYS": <dynamic>[
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ],
  "NARROWWEEKDAYS": <dynamic>[
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
  ],
  "STANDALONENARROWWEEKDAYS": <dynamic>[
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
  ],
  "SHORTQUARTERS": <dynamic>[
    "Q1",
    "Q2",
    "Q3",
    "Q4",
  ],
  "QUARTERS": <dynamic>[
    "1st quarter",
    "2nd quarter",
    "3rd quarter",
    "4th quarter",
  ],
  "AMPMS": <dynamic>[
    "am",
    "pm",
  ],
  "DATEFORMATS": <dynamic>[
    "EEEE, d MMMM y",
    "d MMMM y",
    "d MMM y",
    "dd/MM/y",
  ],
  "TIMEFORMATS": <dynamic>[
    "HH:mm:ss zzzz",
    "HH:mm:ss z",
    "HH:mm:ss",
    "HH:mm",
  ],
  "AVAILABLEFORMATS": null,
  "FIRSTDAYOFWEEK": 0,
  "WEEKENDRANGE": <dynamic>[
    5,
    6,
  ],
  "FIRSTWEEKCUTOFFDAY": 3,
  "DATETIMEFORMATS": <dynamic>[
    "{1}, {0}",
    "{1}, {0}",
    "{1}, {0}",
    "{1}, {0}",
  ],
};

/// Short version of days of week.
const List<String> _shortWeekdays = <String>[
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const List<String> _shortMonths = <String>[
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const List<String> _months = <String>[
  "Jɛnyuari",
  "Fɛbyuari",
  "Mach",
  "Epril",
  "Me",
  "Jun",
  "Julay",
  "Ɔgɔst",
  "Sɛptɛmba",
  "Ɔktoba",
  "Novɛmba",
  "Disɛmba",
];

// #docregion Delegate
class _KriCupertinoLocalizationsDelegate extends LocalizationsDelegate<CupertinoLocalizations> {
  const _KriCupertinoLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == "kri";

  @override
  Future<CupertinoLocalizations> load(Locale locale) {
    final String localeName = intl.Intl.canonicalizedLocale(locale.toString());

    // The locale (in this case `kri`) needs to be initialized into the custom
    // date symbols and patterns setup that Flutter uses.
    date_symbol_data_custom.initializeDateFormattingCustom(
      locale: localeName,
      patterns: kriLocaleDatePatterns,
      symbols: intl.DateSymbols.deserializeFromMap(kriDateSymbols),
    );

    date_symbol_data_custom.initializeDateFormattingCustom(
      locale: "en_US",
      patterns: enUsLocaleDataPatterns,
      symbols: intl.en_USSymbols,
    );

    return SynchronousFuture<CupertinoLocalizations>(
      KriCupertinoLocalizations(
        localeName: localeName,
        // The `intl` library's NumberFormat class is generated from CLDR data
        // (see https://github.com/dart-lang/intl/blob/master/lib/number_symbols_data.dart).
        // Unfortunately, there is no way to use a locale that isn't defined in
        // this map and the only way to work around this is to use a listed
        // locale's NumberFormat symbols. So, here we use the number formats
        // for 'en_US' instead.
        decimalFormat: intl.NumberFormat("#,##0.###", "en_US"),
        // DateFormat here will use the symbols and patterns provided in the
        // `date_symbol_data_custom.initializeDateFormattingCustom` call above.
        // However, an alternative is to simply use a supported locale's
        // DateFormat symbols, similar to NumberFormat above.
        fullYearFormat: intl.DateFormat("y", localeName),
        mediumDateFormat: intl.DateFormat("EEE, MMM d", localeName),
        dayFormat: intl.DateFormat("d", localeName),
        doubleDigitMinuteFormat: intl.DateFormat("d", localeName),
        singleDigitHourFormat: intl.DateFormat("d", localeName),
        singleDigitMinuteFormat: intl.DateFormat("d", localeName),
        singleDigitSecondFormat: intl.DateFormat("d", localeName),
        weekdayFormat: intl.DateFormat("EEE", localeName),
      ),
    );
  }

  @override
  bool shouldReload(_KriCupertinoLocalizationsDelegate old) => false;
}
// #enddocregion Delegate

class KriCupertinoLocalizations extends GlobalCupertinoLocalizations {
  const KriCupertinoLocalizations({
    super.localeName = "kri",
    required super.fullYearFormat,
    required super.mediumDateFormat,
    required super.decimalFormat,
    required super.dayFormat,
    required super.singleDigitHourFormat,
    required super.singleDigitMinuteFormat,
    required super.doubleDigitMinuteFormat,
    required super.singleDigitSecondFormat,
    required super.weekdayFormat,
  });

  static const LocalizationsDelegate<CupertinoLocalizations> delegate = _KriCupertinoLocalizationsDelegate();

  @override
  String datePickerYear(int yearIndex) => yearIndex.toString();

  @override
  String datePickerMonth(int monthIndex) => _months[monthIndex - 1];

  @override
  String datePickerDayOfMonth(int dayIndex, [int? weekDay]) {
    if (weekDay != null) {
      return " ${_shortWeekdays[weekDay - DateTime.monday]} $dayIndex ";
    }

    return dayIndex.toString();
  }

  @override
  String datePickerHour(int hour) => hour.toString();

  @override
  String datePickerHourSemanticsLabel(int hour) => "$hour o'clock";

  @override
  String datePickerMinute(int minute) => minute.toString().padLeft(2, "0");

  @override
  String datePickerMinuteSemanticsLabel(int minute) {
    if (minute == 1) {
      return "1 minute";
    }
    return "$minute minutes";
  }

  @override
  String datePickerMediumDate(DateTime date) {
    return "${_shortWeekdays[date.weekday - DateTime.monday]} "
        "${_shortMonths[date.month - DateTime.january]} "
        "${date.day.toString().padRight(2)}";
  }

  @override
  DatePickerDateOrder get datePickerDateOrder => DatePickerDateOrder.mdy;

  @override
  DatePickerDateTimeOrder get datePickerDateTimeOrder => DatePickerDateTimeOrder.date_time_dayPeriod;

  @override
  String get anteMeridiemAbbreviation => "AM";

  @override
  String get postMeridiemAbbreviation => "PM";

  @override
  String get todayLabel => "Today";

  @override
  String get alertDialogLabel => "Alert";

  @override
  String tabSemanticsLabel({required int tabIndex, required int tabCount}) {
    assert(tabIndex >= 1);
    assert(tabCount >= 1);
    return "Tab $tabIndex of $tabCount";
  }

  @override
  String timerPickerHour(int hour) => hour.toString();

  @override
  String timerPickerMinute(int minute) => minute.toString();

  @override
  String timerPickerSecond(int second) => second.toString();

  @override
  String timerPickerHourLabel(int hour) => hour == 1 ? "hour" : "hours";

  @override
  List<String> get timerPickerHourLabels => const <String>["hour", "hours"];

  @override
  String timerPickerMinuteLabel(int minute) => "min.";

  @override
  List<String> get timerPickerMinuteLabels => const <String>["min."];

  @override
  String timerPickerSecondLabel(int second) => "sec.";

  @override
  List<String> get timerPickerSecondLabels => const <String>["sec."];

  @override
  String get cutButtonLabel => "Cut";

  @override
  String get copyButtonLabel => "Copy";

  @override
  String get pasteButtonLabel => "Paste";

  @override
  String get noSpellCheckReplacementsLabel => "No Replacements Found";

  @override
  String get selectAllButtonLabel => "Select All";

  @override
  String get searchTextFieldPlaceholderLabel => "Search";

  @override
  String get modalBarrierDismissLabel => "Dismiss";

  @override
  String get datePickerDateOrderString => "dmy";

  @override
  String get datePickerDateTimeOrderString => "date_time_dayPeriod";

  @override
  String? get datePickerHourSemanticsLabelFew => null;

  @override
  String? get datePickerHourSemanticsLabelMany => null;

  @override
  String? get datePickerHourSemanticsLabelOne => r"$hour o'clock";

  @override
  String get datePickerHourSemanticsLabelOther => r"$hour o'clock";

  @override
  String? get datePickerMinuteSemanticsLabelOne => "1 minute";

  @override
  String get datePickerMinuteSemanticsLabelOther => r"$minute minutes";

  @override
  String get tabSemanticsLabelRaw => r"Tab $tabIndex of $tabCount";

  @override
  String? get timerPickerHourLabelOne => "hour";

  @override
  String get timerPickerHourLabelOther => "hours";

  @override
  String? get timerPickerMinuteLabelOne => "min.";

  @override
  String get timerPickerMinuteLabelOther => "min.";

  @override
  String? get timerPickerSecondLabelOne => "sec.";

  @override
  String get timerPickerSecondLabelOther => "sec.";

  @override
  String get lookUpButtonLabel => "Look Up";

  @override
  String get menuDismissLabel => "Dismiss menu";

  @override
  String get searchWebButtonLabel => "Search Web";

  @override
  String get shareButtonLabel => "Share...";

  @override
  String get clearButtonLabel => "Clear";

  @override
  String get backButtonLabel => "Go biyɛn";

  @override
  String get cancelButtonLabel => "TAP YA";
}

// #docregion Delegate
class _KriMaterialLocalizationsDelegate extends LocalizationsDelegate<MaterialLocalizations> {
  const _KriMaterialLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == "kri";

  @override
  Future<MaterialLocalizations> load(Locale locale) {
    final String localeName = intl.Intl.canonicalizedLocale(locale.toString());

    // The locale (in this case `kri`) needs to be initialized into the custom
    // date symbols and patterns setup that Flutter uses.
    date_symbol_data_custom.initializeDateFormattingCustom(
      locale: localeName,
      patterns: kriLocaleDatePatterns,
      symbols: intl.DateSymbols.deserializeFromMap(kriDateSymbols),
    );

    date_symbol_data_custom.initializeDateFormattingCustom(
      locale: "en_US",
      patterns: enUsLocaleDataPatterns,
      symbols: intl.en_USSymbols,
    );

    return SynchronousFuture<MaterialLocalizations>(
      KriMaterialLocalizations(
        localeName: localeName,
        // The `intl` library's NumberFormat class is generated from CLDR data
        // (see https://github.com/dart-lang/i18n/blob/main/pkgs/intl/lib/number_symbols_data.dart).
        // Unfortunately, there is no way to use a locale that isn't defined in
        // this map and the only way to work around this is to use a listed
        // locale's NumberFormat symbols. So, here we use the number formats
        // for 'en_US' instead.
        decimalFormat: intl.NumberFormat("#,##0.###", "en_US"),
        twoDigitZeroPaddedFormat: intl.NumberFormat("00", "en_US"),
        // DateFormat here will use the symbols and patterns provided in the
        // `date_symbol_data_custom.initializeDateFormattingCustom` call above.
        // However, an alternative is to simply use a supported locale's
        // DateFormat symbols, similar to NumberFormat above.
        fullYearFormat: intl.DateFormat("y", localeName),
        compactDateFormat: intl.DateFormat("yMd", localeName),
        shortDateFormat: intl.DateFormat("yMMMd", localeName),
        mediumDateFormat: intl.DateFormat("EEE, MMM d", localeName),
        longDateFormat: intl.DateFormat("EEEE, MMMM d, y", localeName),
        yearMonthFormat: intl.DateFormat("MMMM y", localeName),
        shortMonthDayFormat: intl.DateFormat("MMM d", localeName),
      ),
    );
  }

  @override
  bool shouldReload(_KriMaterialLocalizationsDelegate old) => false;
}
// #enddocregion Delegate

/// A custom set of localizations for the 'kri' locale. In this example, only
/// the value for openAppDrawerTooltip was modified to use a custom message as
/// an example. Everything else uses the American English (en_US) messages
/// and formatting.
class KriMaterialLocalizations extends GlobalMaterialLocalizations {
  const KriMaterialLocalizations({
    super.localeName = "kri",
    required super.fullYearFormat,
    required super.compactDateFormat,
    required super.shortDateFormat,
    required super.mediumDateFormat,
    required super.longDateFormat,
    required super.yearMonthFormat,
    required super.shortMonthDayFormat,
    required super.decimalFormat,
    required super.twoDigitZeroPaddedFormat,
  });

  static const LocalizationsDelegate<MaterialLocalizations> delegate = _KriMaterialLocalizationsDelegate();

  // #docregion Getters
  @override
  String get moreButtonTooltip => "Mɔ";

  @override
  String get aboutListTileTitleRaw => r"About $applicationName";

  @override
  String get alertDialogLabel => "Alat";

  // #enddocregion Getters

  @override
  String get anteMeridiemAbbreviation => "AM";

  @override
  String get backButtonTooltip => "Go biyɛn";

  @override
  String get cancelButtonLabel => "TAP YA";

  @override
  String get closeButtonLabel => "LƆK AM";

  @override
  String get closeButtonTooltip => "Lɔk Am";

  @override
  String get collapsedIconTapHint => "Opin am mɔ";

  @override
  String get continueButtonLabel => "KƆNTINYU";

  @override
  String get copyButtonLabel => "TEK AM";

  @override
  String get cutButtonLabel => "KƆT AM";

  @override
  String get deleteButtonTooltip => "Pul am";

  @override
  String get dialogLabel => "Mek wi tɔk";

  @override
  String get drawerLabel => "Fɔ sho yu usay fɔ go";

  @override
  String get expandedIconTapHint => "Ridyus am";

  @override
  String get firstPageTooltip => "Fɔs pej";

  @override
  String get hideAccountsLabel => "Ayd di akawnt";

  @override
  String get lastPageTooltip => "Las pej";

  @override
  String get licensesPageTitle => "Laysin dɛm";

  @override
  String get modalBarrierDismissLabel => "Fɔgɛt bɔt am";

  @override
  String get nextMonthTooltip => "Nɛks mɔnt";

  @override
  String get nextPageTooltip => "Nɛks pej";

  @override
  String get okButtonLabel => "ƆKE";

  @override
  // A custom drawer tooltip message.
  String get openAppDrawerTooltip => "Custom Navigation Menu Tooltip";

  // #docregion Raw
  @override
  String get pageRowsInfoTitleRaw => r"$firstRow–$lastRow of $rowCount";

  @override
  String get pageRowsInfoTitleApproximateRaw => r"$firstRow–$lastRow of about $rowCount";
  // #enddocregion Raw

  @override
  String get pasteButtonLabel => "PUT AM YA";

  @override
  String get popupMenuLabel => "Tin dɛn we yu fɔ si";

  @override
  String get menuBarMenuLabel => "Menu Bar Label";

  @override
  String get postMeridiemAbbreviation => "PM";

  @override
  String get previousMonthTooltip => "Mɔnt dɛn we dɔn pas";

  @override
  String get previousPageTooltip => "Pej dɛn we dɔn pas";

  @override
  String get refreshIndicatorSemanticLabel => "Do am igen";

  @override
  String? get remainingTextFieldCharacterCountFew => null;

  @override
  String? get remainingTextFieldCharacterCountMany => null;

  @override
  String get remainingTextFieldCharacterCountOne => "1 karakta lɛf";

  @override
  String get remainingTextFieldCharacterCountOther => r"$remainingCount karakta lɛf";

  @override
  String? get remainingTextFieldCharacterCountTwo => null;

  @override
  String get remainingTextFieldCharacterCountZero => "No karakta nɔ lɛf";

  @override
  String get reorderItemDown => "Go dɔng";

  @override
  String get reorderItemLeft => "Go lɛft";

  @override
  String get reorderItemRight => "Go rayt";

  @override
  String get reorderItemToEnd => "Go usay di tin tap";

  @override
  String get reorderItemToStart => "Go usay i bigin";

  @override
  String get reorderItemUp => "Go ɔp";

  @override
  String get rowsPerPageTitle => "Ɔmɔs ro de na di pej dɛm:";

  @override
  ScriptCategory get scriptCategory => ScriptCategory.englishLike;

  @override
  String get searchFieldLabel => "Wach insay";

  @override
  String get selectAllButtonLabel => "PIK ƆLTIN";

  @override
  String? get selectedRowCountTitleFew => null;

  @override
  String? get selectedRowCountTitleMany => null;

  @override
  String get selectedRowCountTitleOne => "Dɔn pik 1 tin";

  @override
  String get selectedRowCountTitleOther => r"$selectedRowCount items selected";

  @override
  String? get selectedRowCountTitleTwo => null;

  @override
  String get selectedRowCountTitleZero => "Nɔ pik natin";

  @override
  String get showAccountsLabel => "Sho akawnt";

  @override
  String get showMenuTooltip => "Tin dɛn we yu fɔ si";

  @override
  String get signedInLabel => "Yu de insai naw";

  @override
  String get tabLabelRaw => r"Tab $tabIndex of $tabCount";

  @override
  TimeOfDayFormat get timeOfDayFormatRaw => TimeOfDayFormat.h_colon_mm_space_a;

  @override
  String get timePickerHourModeAnnouncement => "Pik ɔmɔs awa";

  @override
  String get timePickerMinuteModeAnnouncement => "Pik ɔmɔs minit";

  @override
  String get viewLicensesButtonLabel => "WACH LAYSIN DƐM";

  @override
  List<String> get narrowWeekdays => const <String>["S", "M", "T", "W", "T", "F", "S"];

  @override
  int get firstDayOfWeekIndex => 0;

  @override
  String get calendarModeButtonLabel => "Go to kalɛnda";

  @override
  String get dateHelpText => "mm/dd/yyyy";

  @override
  String get dateInputLabel => "Put det";

  @override
  String get dateOutOfRangeLabel => "Nɔ ebul si am.";

  @override
  String get datePickerHelpText => "PIK DET";

  @override
  String get dateRangeEndDateSemanticLabelRaw => r"End date $fullDate";

  @override
  String get dateRangeEndLabel => "Det we yu dɔn";

  @override
  String get dateRangePickerHelpText => "SELECT RANGE";

  @override
  String get dateRangeStartDateSemanticLabelRaw => "Start date \$fullDate";

  @override
  String get dateRangeStartLabel => "Det we yu bigin";

  @override
  String get dateSeparator => "/";

  @override
  String get dialModeButtonLabel => "Switch to dial picker mode";

  @override
  String get inputDateModeButtonLabel => "Switch to input";

  @override
  String get inputTimeModeButtonLabel => "Switch to text input mode";

  @override
  String get invalidDateFormatLabel => "Fɔmat nɔ kɔrɛkt.";

  @override
  String get invalidDateRangeLabel => "Invalid range.";

  @override
  String get invalidTimeLabel => "Put tɛm we kɔrɛkt ";

  @override
  String get licensesPackageDetailTextOther => "\$licenseCount licenses";

  @override
  String get saveButtonLabel => "KIP AM";

  @override
  String get selectYearSemanticsLabel => "Pik iya";

  @override
  String get timePickerDialHelpText => "PIK TƐM";

  @override
  String get timePickerHourLabel => "Awa";

  @override
  String get timePickerInputHelpText => "PUT TƐM";

  @override
  String get timePickerMinuteLabel => "Minit";

  @override
  String get unspecifiedDate => "Det";

  @override
  String get unspecifiedDateRange => "Date Range";

  @override
  String get keyboardKeyAlt => "Alt";

  @override
  String get keyboardKeyAltGraph => "AltGr";

  @override
  String get keyboardKeyBackspace => "Backspace";

  @override
  String get keyboardKeyCapsLock => "Caps Lock";

  @override
  String get keyboardKeyChannelDown => "Channel Down";

  @override
  String get keyboardKeyChannelUp => "Channel Up";

  @override
  String get keyboardKeyControl => "Ctrl";

  @override
  String get keyboardKeyDelete => "Del";

  @override
  String get keyboardKeyEject => "Eject";

  @override
  String get keyboardKeyEnd => "End";

  @override
  String get keyboardKeyEscape => "Esc";

  @override
  String get keyboardKeyFn => "Fn";

  @override
  String get keyboardKeyHome => "Home";

  @override
  String get keyboardKeyInsert => "Insert";

  @override
  String get keyboardKeyMeta => "Meta";

  @override
  String get keyboardKeyMetaMacOs => "Command";

  @override
  String get keyboardKeyMetaWindows => "Win";

  @override
  String get keyboardKeyNumLock => "Num Lock";

  @override
  String get keyboardKeyNumpad0 => "Num 0";

  @override
  String get keyboardKeyNumpad1 => "Num 1";

  @override
  String get keyboardKeyNumpad2 => "Num 2";

  @override
  String get keyboardKeyNumpad3 => "Num 3";

  @override
  String get keyboardKeyNumpad4 => "Num 4";

  @override
  String get keyboardKeyNumpad5 => "Num 5";

  @override
  String get keyboardKeyNumpad6 => "Num 6";

  @override
  String get keyboardKeyNumpad7 => "Num 7";

  @override
  String get keyboardKeyNumpad8 => "Num 8";

  @override
  String get keyboardKeyNumpad9 => "Num 9";

  @override
  String get keyboardKeyNumpadAdd => "Num  +";

  @override
  String get keyboardKeyNumpadComma => "Num ,";

  @override
  String get keyboardKeyNumpadDecimal => "Num .";

  @override
  String get keyboardKeyNumpadDivide => "Num /";

  @override
  String get keyboardKeyNumpadEnter => "Num Enter";

  @override
  String get keyboardKeyNumpadEqual => "Num =";

  @override
  String get keyboardKeyNumpadMultiply => "Num *";

  @override
  String get keyboardKeyNumpadParenLeft => "Num (";

  @override
  String get keyboardKeyNumpadParenRight => "Num )";

  @override
  String get keyboardKeyNumpadSubtract => "Num -";

  @override
  String get keyboardKeyPageDown => "PgDown";

  @override
  String get keyboardKeyPageUp => "PgUp";

  @override
  String get keyboardKeyPower => "Put am ɔn";

  @override
  String get keyboardKeyPowerOff => "Ɔt am";

  @override
  String get keyboardKeyPrintScreen => "Print skrin";

  @override
  String get keyboardKeyScrollLock => "Scroll Lock";

  @override
  String get keyboardKeySelect => "Pik";

  @override
  String get keyboardKeyShift => "Shift";

  @override
  String get keyboardKeySpace => "Space";

  @override
  String get scrimOnTapHintRaw => r"Close $modalRouteContentName";

  @override
  String get bottomSheetLabel => "Bottom Sheet";

  @override
  String get currentDateLabel => "Tide";

  @override
  String get scrimLabel => "Scrim";

  @override
  String get collapsedHint => "Go insay mɔ";

  @override
  String get expandedHint => "Ridyus am";

  @override
  String get expansionTileCollapsedHint => "double tap to expand";

  @override
  String get expansionTileCollapsedTapHint => "Expand for more details";

  @override
  String get expansionTileExpandedHint => "double tap to collapse'";

  @override
  String get expansionTileExpandedTapHint => "Ridyus am";

  @override
  String get scanTextButtonLabel => "Skan tɛkst";

  @override
  String get lookUpButtonLabel => "Look Up";

  @override
  String get menuDismissLabel => "Dismiss menu";

  @override
  String get searchWebButtonLabel => "Search Web";

  @override
  String get shareButtonLabel => "Share...";

  @override
  String get clearButtonTooltip => "Clear text";

  @override
  String get selectedDateLabel => "Selected";
}
