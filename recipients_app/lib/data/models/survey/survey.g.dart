// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'survey.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Survey _$SurveyFromJson(Map<String, dynamic> json) => Survey(
  id: json['id'] as String? ?? '',
  status: $enumDecodeNullable(_$SurveyServerStatusEnumMap, json['status']),
  dueDateAt: _$JsonConverterFromJson<Object, Timestamp>(json['due_date_at'], const TimestampConverter().fromJson),
  completedAt: _$JsonConverterFromJson<Object, Timestamp>(json['completed_at'], const TimestampConverter().fromJson),
  accessEmail: json['access_email'] as String?,
  accessPassword: json['access_pw'] as String?,
);

Map<String, dynamic> _$SurveyToJson(Survey instance) => <String, dynamic>{
  'id': instance.id,
  'status': _$SurveyServerStatusEnumMap[instance.status],
  'due_date_at': _$JsonConverterToJson<Object, Timestamp>(instance.dueDateAt, const TimestampConverter().toJson),
  'completed_at': _$JsonConverterToJson<Object, Timestamp>(instance.completedAt, const TimestampConverter().toJson),
  'access_email': instance.accessEmail,
  'access_pw': instance.accessPassword,
};

const _$SurveyServerStatusEnumMap = {
  SurveyServerStatus.created: 'new',
  SurveyServerStatus.sent: 'sent',
  SurveyServerStatus.scheduled: 'scheduled',
  SurveyServerStatus.inProgress: 'in-progress',
  SurveyServerStatus.completed: 'completed',
  SurveyServerStatus.missed: 'missed',
};

Value? _$JsonConverterFromJson<Json, Value>(Object? json, Value? Function(Json json) fromJson) =>
    json == null ? null : fromJson(json as Json);

Json? _$JsonConverterToJson<Json, Value>(Value? value, Json? Function(Value value) toJson) =>
    value == null ? null : toJson(value);
