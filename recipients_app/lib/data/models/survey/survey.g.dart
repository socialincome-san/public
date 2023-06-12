// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'survey.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Survey _$SurveyFromJson(Map<String, dynamic> json) => Survey(
      id: json['id'] as String? ?? '',
      status: $enumDecodeNullable(_$SurveyServerStatusEnumMap, json['status']),
      dueDateAt: const TimestampConverter().fromJson(json['due_date_at']),
      completedAt: const TimestampConverter().fromJson(json['completed_at']),
      accessEmail: json['access_email'] as String?,
      accessPassword: json['access_pw'] as String?,
    );

Map<String, dynamic> _$SurveyToJson(Survey instance) => <String, dynamic>{
      'id': instance.id,
      'status': _$SurveyServerStatusEnumMap[instance.status],
      'due_date_at': const TimestampConverter().toJson(instance.dueDateAt),
      'completed_at': const TimestampConverter().toJson(instance.completedAt),
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
