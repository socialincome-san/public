//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of si.api;

class Survey {
  /// Returns a new [Survey] instance.
  Survey({
    required this.id,
    required this.name,
    required this.recipientId,
    required this.questionnaire,
    required this.language,
    required this.dueAt,
    this.completedAt,
    required this.status,
    required this.data,
    required this.accessEmail,
    required this.accessPw,
    required this.accessToken,
    this.surveyScheduleId,
    required this.createdAt,
    this.updatedAt,
  });

  String id;

  String name;

  String recipientId;

  String questionnaire;

  String language;

  String dueAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? completedAt;

  String status;

  Object? data;

  String accessEmail;

  String accessPw;

  String accessToken;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? surveyScheduleId;

  String createdAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Survey &&
    other.id == id &&
    other.name == name &&
    other.recipientId == recipientId &&
    other.questionnaire == questionnaire &&
    other.language == language &&
    other.dueAt == dueAt &&
    other.completedAt == completedAt &&
    other.status == status &&
    other.data == data &&
    other.accessEmail == accessEmail &&
    other.accessPw == accessPw &&
    other.accessToken == accessToken &&
    other.surveyScheduleId == surveyScheduleId &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (recipientId.hashCode) +
    (questionnaire.hashCode) +
    (language.hashCode) +
    (dueAt.hashCode) +
    (completedAt == null ? 0 : completedAt!.hashCode) +
    (status.hashCode) +
    (data == null ? 0 : data!.hashCode) +
    (accessEmail.hashCode) +
    (accessPw.hashCode) +
    (accessToken.hashCode) +
    (surveyScheduleId == null ? 0 : surveyScheduleId!.hashCode) +
    (createdAt.hashCode) +
    (updatedAt == null ? 0 : updatedAt!.hashCode);

  @override
  String toString() => 'Survey[id=$id, name=$name, recipientId=$recipientId, questionnaire=$questionnaire, language=$language, dueAt=$dueAt, completedAt=$completedAt, status=$status, data=$data, accessEmail=$accessEmail, accessPw=$accessPw, accessToken=$accessToken, surveyScheduleId=$surveyScheduleId, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
      json[r'recipientId'] = this.recipientId;
      json[r'questionnaire'] = this.questionnaire;
      json[r'language'] = this.language;
      json[r'dueAt'] = this.dueAt;
    if (this.completedAt != null) {
      json[r'completedAt'] = this.completedAt;
    } else {
      json[r'completedAt'] = null;
    }
      json[r'status'] = this.status;
    if (this.data != null) {
      json[r'data'] = this.data;
    } else {
      json[r'data'] = null;
    }
      json[r'accessEmail'] = this.accessEmail;
      json[r'accessPw'] = this.accessPw;
      json[r'accessToken'] = this.accessToken;
    if (this.surveyScheduleId != null) {
      json[r'surveyScheduleId'] = this.surveyScheduleId;
    } else {
      json[r'surveyScheduleId'] = null;
    }
      json[r'createdAt'] = this.createdAt;
    if (this.updatedAt != null) {
      json[r'updatedAt'] = this.updatedAt;
    } else {
      json[r'updatedAt'] = null;
    }
    return json;
  }

  /// Returns a new [Survey] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Survey? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "Survey[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "Survey[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return Survey(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        recipientId: mapValueOfType<String>(json, r'recipientId')!,
        questionnaire: mapValueOfType<String>(json, r'questionnaire')!,
        language: mapValueOfType<String>(json, r'language')!,
        dueAt: mapValueOfType<String>(json, r'dueAt')!,
        completedAt: mapValueOfType<String>(json, r'completedAt'),
        status: mapValueOfType<String>(json, r'status')!,
        data: mapValueOfType<Object>(json, r'data'),
        accessEmail: mapValueOfType<String>(json, r'accessEmail')!,
        accessPw: mapValueOfType<String>(json, r'accessPw')!,
        accessToken: mapValueOfType<String>(json, r'accessToken')!,
        surveyScheduleId: mapValueOfType<String>(json, r'surveyScheduleId'),
        createdAt: mapValueOfType<String>(json, r'createdAt')!,
        updatedAt: mapValueOfType<String>(json, r'updatedAt'),
      );
    }
    return null;
  }

  static List<Survey> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Survey>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Survey.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Survey> mapFromJson(dynamic json) {
    final map = <String, Survey>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Survey.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Survey-objects as value to a dart map
  static Map<String, List<Survey>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Survey>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Survey.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'recipientId',
    'questionnaire',
    'language',
    'dueAt',
    'status',
    'data',
    'accessEmail',
    'accessPw',
    'accessToken',
    'createdAt',
  };
}

