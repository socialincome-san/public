// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey.dart';

class SurveyServerStatusMapper extends EnumMapper<SurveyServerStatus> {
  SurveyServerStatusMapper._();

  static SurveyServerStatusMapper? _instance;
  static SurveyServerStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyServerStatusMapper._());
    }
    return _instance!;
  }

  static SurveyServerStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SurveyServerStatus decode(dynamic value) {
    switch (value) {
      case "created":
        return SurveyServerStatus.created;
      case "sent":
        return SurveyServerStatus.sent;
      case "scheduled":
        return SurveyServerStatus.scheduled;
      case "in-progress":
        return SurveyServerStatus.inProgress;
      case "completed":
        return SurveyServerStatus.completed;
      case "missed":
        return SurveyServerStatus.missed;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SurveyServerStatus self) {
    switch (self) {
      case SurveyServerStatus.created:
        return "created";
      case SurveyServerStatus.sent:
        return "sent";
      case SurveyServerStatus.scheduled:
        return "scheduled";
      case SurveyServerStatus.inProgress:
        return "in-progress";
      case SurveyServerStatus.completed:
        return "completed";
      case SurveyServerStatus.missed:
        return "missed";
    }
  }
}

extension SurveyServerStatusMapperExtension on SurveyServerStatus {
  dynamic toValue() {
    SurveyServerStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SurveyServerStatus>(this);
  }
}

class SurveyMapper extends ClassMapperBase<Survey> {
  SurveyMapper._();

  static SurveyMapper? _instance;
  static SurveyMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyMapper._());
      SurveyServerStatusMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Survey';

  static String _$id(Survey v) => v.id;
  static const Field<Survey, String> _f$id = Field('id', _$id);
  static SurveyServerStatus? _$status(Survey v) => v.status;
  static const Field<Survey, SurveyServerStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
  );
  static Timestamp? _$dueDateAt(Survey v) => v.dueDateAt;
  static const Field<Survey, Timestamp> _f$dueDateAt = Field(
    'dueDateAt',
    _$dueDateAt,
    opt: true,
  );
  static Timestamp? _$completedAt(Survey v) => v.completedAt;
  static const Field<Survey, Timestamp> _f$completedAt = Field(
    'completedAt',
    _$completedAt,
    opt: true,
  );
  static String? _$accessEmail(Survey v) => v.accessEmail;
  static const Field<Survey, String> _f$accessEmail = Field(
    'accessEmail',
    _$accessEmail,
    opt: true,
  );
  static String? _$accessPassword(Survey v) => v.accessPassword;
  static const Field<Survey, String> _f$accessPassword = Field(
    'accessPassword',
    _$accessPassword,
    opt: true,
  );

  @override
  final MappableFields<Survey> fields = const {
    #id: _f$id,
    #status: _f$status,
    #dueDateAt: _f$dueDateAt,
    #completedAt: _f$completedAt,
    #accessEmail: _f$accessEmail,
    #accessPassword: _f$accessPassword,
  };

  static Survey _instantiate(DecodingData data) {
    return Survey(
      id: data.dec(_f$id),
      status: data.dec(_f$status),
      dueDateAt: data.dec(_f$dueDateAt),
      completedAt: data.dec(_f$completedAt),
      accessEmail: data.dec(_f$accessEmail),
      accessPassword: data.dec(_f$accessPassword),
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
    SurveyServerStatus? status,
    Timestamp? dueDateAt,
    Timestamp? completedAt,
    String? accessEmail,
    String? accessPassword,
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
    Object? status = $none,
    Object? dueDateAt = $none,
    Object? completedAt = $none,
    Object? accessEmail = $none,
    Object? accessPassword = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (status != $none) #status: status,
      if (dueDateAt != $none) #dueDateAt: dueDateAt,
      if (completedAt != $none) #completedAt: completedAt,
      if (accessEmail != $none) #accessEmail: accessEmail,
      if (accessPassword != $none) #accessPassword: accessPassword,
    }),
  );
  @override
  Survey $make(CopyWithData data) => Survey(
    id: data.get(#id, or: $value.id),
    status: data.get(#status, or: $value.status),
    dueDateAt: data.get(#dueDateAt, or: $value.dueDateAt),
    completedAt: data.get(#completedAt, or: $value.completedAt),
    accessEmail: data.get(#accessEmail, or: $value.accessEmail),
    accessPassword: data.get(#accessPassword, or: $value.accessPassword),
  );

  @override
  SurveyCopyWith<$R2, Survey, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _SurveyCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

