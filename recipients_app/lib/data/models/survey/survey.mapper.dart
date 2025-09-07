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
      SurveyQuestionnaireMapper.ensureInitialized();
      RecipientMainLanguageMapper.ensureInitialized();
      SurveyStatusMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Survey';

  static String _$id(Survey v) => v.id;
  static const Field<Survey, String> _f$id = Field('id', _$id);
  static String _$recipientId(Survey v) => v.recipientId;
  static const Field<Survey, String> _f$recipientId = Field(
    'recipientId',
    _$recipientId,
  );
  static SurveyQuestionnaire _$questionnaire(Survey v) => v.questionnaire;
  static const Field<Survey, SurveyQuestionnaire> _f$questionnaire = Field(
    'questionnaire',
    _$questionnaire,
  );
  static String _$recipientName(Survey v) => v.recipientName;
  static const Field<Survey, String> _f$recipientName = Field(
    'recipientName',
    _$recipientName,
  );
  static RecipientMainLanguage _$language(Survey v) => v.language;
  static const Field<Survey, RecipientMainLanguage> _f$language = Field(
    'language',
    _$language,
  );
  static DateTime _$dueDateAt(Survey v) => v.dueDateAt;
  static const Field<Survey, DateTime> _f$dueDateAt = Field(
    'dueDateAt',
    _$dueDateAt,
  );
  static SurveyStatus _$status(Survey v) => v.status;
  static const Field<Survey, SurveyStatus> _f$status = Field(
    'status',
    _$status,
  );
  static String _$data(Survey v) => v.data;
  static const Field<Survey, String> _f$data = Field('data', _$data);
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
  static DateTime? _$sentAt(Survey v) => v.sentAt;
  static const Field<Survey, DateTime> _f$sentAt = Field(
    'sentAt',
    _$sentAt,
    opt: true,
  );
  static DateTime? _$completedAt(Survey v) => v.completedAt;
  static const Field<Survey, DateTime> _f$completedAt = Field(
    'completedAt',
    _$completedAt,
    opt: true,
  );
  static String? _$comments(Survey v) => v.comments;
  static const Field<Survey, String> _f$comments = Field(
    'comments',
    _$comments,
    opt: true,
  );

  @override
  final MappableFields<Survey> fields = const {
    #id: _f$id,
    #recipientId: _f$recipientId,
    #questionnaire: _f$questionnaire,
    #recipientName: _f$recipientName,
    #language: _f$language,
    #dueDateAt: _f$dueDateAt,
    #status: _f$status,
    #data: _f$data,
    #accessEmail: _f$accessEmail,
    #accessPw: _f$accessPw,
    #accessToken: _f$accessToken,
    #sentAt: _f$sentAt,
    #completedAt: _f$completedAt,
    #comments: _f$comments,
  };

  static Survey _instantiate(DecodingData data) {
    return Survey(
      id: data.dec(_f$id),
      recipientId: data.dec(_f$recipientId),
      questionnaire: data.dec(_f$questionnaire),
      recipientName: data.dec(_f$recipientName),
      language: data.dec(_f$language),
      dueDateAt: data.dec(_f$dueDateAt),
      status: data.dec(_f$status),
      data: data.dec(_f$data),
      accessEmail: data.dec(_f$accessEmail),
      accessPw: data.dec(_f$accessPw),
      accessToken: data.dec(_f$accessToken),
      sentAt: data.dec(_f$sentAt),
      completedAt: data.dec(_f$completedAt),
      comments: data.dec(_f$comments),
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
    String? recipientId,
    SurveyQuestionnaire? questionnaire,
    String? recipientName,
    RecipientMainLanguage? language,
    DateTime? dueDateAt,
    SurveyStatus? status,
    String? data,
    String? accessEmail,
    String? accessPw,
    String? accessToken,
    DateTime? sentAt,
    DateTime? completedAt,
    String? comments,
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
    String? recipientId,
    SurveyQuestionnaire? questionnaire,
    String? recipientName,
    RecipientMainLanguage? language,
    DateTime? dueDateAt,
    SurveyStatus? status,
    String? data,
    String? accessEmail,
    String? accessPw,
    String? accessToken,
    Object? sentAt = $none,
    Object? completedAt = $none,
    Object? comments = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (recipientId != null) #recipientId: recipientId,
      if (questionnaire != null) #questionnaire: questionnaire,
      if (recipientName != null) #recipientName: recipientName,
      if (language != null) #language: language,
      if (dueDateAt != null) #dueDateAt: dueDateAt,
      if (status != null) #status: status,
      if (data != null) #data: data,
      if (accessEmail != null) #accessEmail: accessEmail,
      if (accessPw != null) #accessPw: accessPw,
      if (accessToken != null) #accessToken: accessToken,
      if (sentAt != $none) #sentAt: sentAt,
      if (completedAt != $none) #completedAt: completedAt,
      if (comments != $none) #comments: comments,
    }),
  );
  @override
  Survey $make(CopyWithData data) => Survey(
    id: data.get(#id, or: $value.id),
    recipientId: data.get(#recipientId, or: $value.recipientId),
    questionnaire: data.get(#questionnaire, or: $value.questionnaire),
    recipientName: data.get(#recipientName, or: $value.recipientName),
    language: data.get(#language, or: $value.language),
    dueDateAt: data.get(#dueDateAt, or: $value.dueDateAt),
    status: data.get(#status, or: $value.status),
    data: data.get(#data, or: $value.data),
    accessEmail: data.get(#accessEmail, or: $value.accessEmail),
    accessPw: data.get(#accessPw, or: $value.accessPw),
    accessToken: data.get(#accessToken, or: $value.accessToken),
    sentAt: data.get(#sentAt, or: $value.sentAt),
    completedAt: data.get(#completedAt, or: $value.completedAt),
    comments: data.get(#comments, or: $value.comments),
  );

  @override
  SurveyCopyWith<$R2, Survey, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _SurveyCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

