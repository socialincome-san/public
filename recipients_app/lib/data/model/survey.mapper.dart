// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey.dart';

class SurveyMapper extends ClassMapperBase<Survey> {
  SurveyMapper._();

  static SurveyMapper? _instance;
  static SurveyMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'Survey';

  static String _$id(Survey v) => v.id;
  static const Field<Survey, String> _f$id = Field('id', _$id);
  static String _$name(Survey v) => v.name;
  static const Field<Survey, String> _f$name = Field('name', _$name);
  static String _$recipientId(Survey v) => v.recipientId;
  static const Field<Survey, String> _f$recipientId = Field(
    'recipientId',
    _$recipientId,
  );
  static String _$questionnaire(Survey v) => v.questionnaire;
  static const Field<Survey, String> _f$questionnaire = Field(
    'questionnaire',
    _$questionnaire,
  );
  static String _$language(Survey v) => v.language;
  static const Field<Survey, String> _f$language = Field(
    'language',
    _$language,
  );
  static String _$dueAt(Survey v) => v.dueAt;
  static const Field<Survey, String> _f$dueAt = Field('dueAt', _$dueAt);
  static String? _$completedAt(Survey v) => v.completedAt;
  static const Field<Survey, String> _f$completedAt = Field(
    'completedAt',
    _$completedAt,
    opt: true,
  );
  static String _$status(Survey v) => v.status;
  static const Field<Survey, String> _f$status = Field('status', _$status);
  static Object? _$data(Survey v) => v.data;
  static const Field<Survey, Object> _f$data = Field('data', _$data);
  static String _$accessEmail(Survey v) => v.accessEmail;
  static const Field<Survey, String> _f$accessEmail = Field(
    'accessEmail',
    _$accessEmail,
  );
  static String _$accessPw(Survey v) => v.accessPw;
  static const Field<Survey, String> _f$accessPw = Field(
    'accessPw',
    _$accessPw,
  );
  static String _$accessToken(Survey v) => v.accessToken;
  static const Field<Survey, String> _f$accessToken = Field(
    'accessToken',
    _$accessToken,
  );
  static String? _$surveyScheduleId(Survey v) => v.surveyScheduleId;
  static const Field<Survey, String> _f$surveyScheduleId = Field(
    'surveyScheduleId',
    _$surveyScheduleId,
    opt: true,
  );
  static String _$createdAt(Survey v) => v.createdAt;
  static const Field<Survey, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(Survey v) => v.updatedAt;
  static const Field<Survey, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<Survey> fields = const {
    #id: _f$id,
    #name: _f$name,
    #recipientId: _f$recipientId,
    #questionnaire: _f$questionnaire,
    #language: _f$language,
    #dueAt: _f$dueAt,
    #completedAt: _f$completedAt,
    #status: _f$status,
    #data: _f$data,
    #accessEmail: _f$accessEmail,
    #accessPw: _f$accessPw,
    #accessToken: _f$accessToken,
    #surveyScheduleId: _f$surveyScheduleId,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Survey _instantiate(DecodingData data) {
    return Survey(
      id: data.dec(_f$id),
      name: data.dec(_f$name),
      recipientId: data.dec(_f$recipientId),
      questionnaire: data.dec(_f$questionnaire),
      language: data.dec(_f$language),
      dueAt: data.dec(_f$dueAt),
      completedAt: data.dec(_f$completedAt),
      status: data.dec(_f$status),
      data: data.dec(_f$data),
      accessEmail: data.dec(_f$accessEmail),
      accessPw: data.dec(_f$accessPw),
      accessToken: data.dec(_f$accessToken),
      surveyScheduleId: data.dec(_f$surveyScheduleId),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Survey fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Survey>(map);
  }

  static Survey fromJson(String json) {
    return ensureInitialized().decodeJson<Survey>(json);
  }
}

mixin SurveyMappable {
  String toJson() {
    return SurveyMapper.ensureInitialized().encodeJson<Survey>(this as Survey);
  }

  Map<String, dynamic> toMap() {
    return SurveyMapper.ensureInitialized().encodeMap<Survey>(this as Survey);
  }

  SurveyCopyWith<Survey, Survey, Survey> get copyWith =>
      _SurveyCopyWithImpl<Survey, Survey>(this as Survey, $identity, $identity);
  @override
  String toString() {
    return SurveyMapper.ensureInitialized().stringifyValue(this as Survey);
  }

  @override
  bool operator ==(Object other) {
    return SurveyMapper.ensureInitialized().equalsValue(this as Survey, other);
  }

  @override
  int get hashCode {
    return SurveyMapper.ensureInitialized().hashValue(this as Survey);
  }
}

extension SurveyValueCopy<$R, $Out> on ObjectCopyWith<$R, Survey, $Out> {
  SurveyCopyWith<$R, Survey, $Out> get $asSurvey =>
      $base.as((v, t, t2) => _SurveyCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class SurveyCopyWith<$R, $In extends Survey, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    String? name,
    String? recipientId,
    String? questionnaire,
    String? language,
    String? dueAt,
    String? completedAt,
    String? status,
    Object? data,
    String? accessEmail,
    String? accessPw,
    String? accessToken,
    String? surveyScheduleId,
    String? createdAt,
    String? updatedAt,
  });
  SurveyCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _SurveyCopyWithImpl<$R, $Out> extends ClassCopyWithBase<$R, Survey, $Out>
    implements SurveyCopyWith<$R, Survey, $Out> {
  _SurveyCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Survey> $mapper = SurveyMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    String? name,
    String? recipientId,
    String? questionnaire,
    String? language,
    String? dueAt,
    Object? completedAt = $none,
    String? status,
    Object? data = $none,
    String? accessEmail,
    String? accessPw,
    String? accessToken,
    Object? surveyScheduleId = $none,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (name != null) #name: name,
      if (recipientId != null) #recipientId: recipientId,
      if (questionnaire != null) #questionnaire: questionnaire,
      if (language != null) #language: language,
      if (dueAt != null) #dueAt: dueAt,
      if (completedAt != $none) #completedAt: completedAt,
      if (status != null) #status: status,
      if (data != $none) #data: data,
      if (accessEmail != null) #accessEmail: accessEmail,
      if (accessPw != null) #accessPw: accessPw,
      if (accessToken != null) #accessToken: accessToken,
      if (surveyScheduleId != $none) #surveyScheduleId: surveyScheduleId,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Survey $make(CopyWithData data) => Survey(
    id: data.get(#id, or: $value.id),
    name: data.get(#name, or: $value.name),
    recipientId: data.get(#recipientId, or: $value.recipientId),
    questionnaire: data.get(#questionnaire, or: $value.questionnaire),
    language: data.get(#language, or: $value.language),
    dueAt: data.get(#dueAt, or: $value.dueAt),
    completedAt: data.get(#completedAt, or: $value.completedAt),
    status: data.get(#status, or: $value.status),
    data: data.get(#data, or: $value.data),
    accessEmail: data.get(#accessEmail, or: $value.accessEmail),
    accessPw: data.get(#accessPw, or: $value.accessPw),
    accessToken: data.get(#accessToken, or: $value.accessToken),
    surveyScheduleId: data.get(#surveyScheduleId, or: $value.surveyScheduleId),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  SurveyCopyWith<$R2, Survey, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _SurveyCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

