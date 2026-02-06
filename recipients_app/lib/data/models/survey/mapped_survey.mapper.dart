// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'mapped_survey.dart';

class MappedSurveyMapper extends ClassMapperBase<MappedSurvey> {
  MappedSurveyMapper._();

  static MappedSurveyMapper? _instance;
  static MappedSurveyMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = MappedSurveyMapper._());
      SurveyMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'MappedSurvey';

  static String _$name(MappedSurvey v) => v.name;
  static const Field<MappedSurvey, String> _f$name = Field('name', _$name);
  static Survey _$survey(MappedSurvey v) => v.survey;
  static const Field<MappedSurvey, Survey> _f$survey = Field(
    'survey',
    _$survey,
  );
  static String _$surveyUrl(MappedSurvey v) => v.surveyUrl;
  static const Field<MappedSurvey, String> _f$surveyUrl = Field(
    'surveyUrl',
    _$surveyUrl,
  );
  static SurveyCardStatus _$cardStatus(MappedSurvey v) => v.cardStatus;
  static const Field<MappedSurvey, SurveyCardStatus> _f$cardStatus = Field(
    'cardStatus',
    _$cardStatus,
  );
  static int? _$daysToOverdue(MappedSurvey v) => v.daysToOverdue;
  static const Field<MappedSurvey, int> _f$daysToOverdue = Field(
    'daysToOverdue',
    _$daysToOverdue,
  );
  static int? _$daysAfterOverdue(MappedSurvey v) => v.daysAfterOverdue;
  static const Field<MappedSurvey, int> _f$daysAfterOverdue = Field(
    'daysAfterOverdue',
    _$daysAfterOverdue,
  );

  @override
  final MappableFields<MappedSurvey> fields = const {
    #name: _f$name,
    #survey: _f$survey,
    #surveyUrl: _f$surveyUrl,
    #cardStatus: _f$cardStatus,
    #daysToOverdue: _f$daysToOverdue,
    #daysAfterOverdue: _f$daysAfterOverdue,
  };

  static MappedSurvey _instantiate(DecodingData data) {
    return MappedSurvey(
      name: data.dec(_f$name),
      survey: data.dec(_f$survey),
      surveyUrl: data.dec(_f$surveyUrl),
      cardStatus: data.dec(_f$cardStatus),
      daysToOverdue: data.dec(_f$daysToOverdue),
      daysAfterOverdue: data.dec(_f$daysAfterOverdue),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static MappedSurvey fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<MappedSurvey>(map);
  }

  static MappedSurvey fromJson(String json) {
    return ensureInitialized().decodeJson<MappedSurvey>(json);
  }
}

mixin MappedSurveyMappable {
  String toJson() {
    return MappedSurveyMapper.ensureInitialized().encodeJson<MappedSurvey>(
      this as MappedSurvey,
    );
  }

  Map<String, dynamic> toMap() {
    return MappedSurveyMapper.ensureInitialized().encodeMap<MappedSurvey>(
      this as MappedSurvey,
    );
  }

  MappedSurveyCopyWith<MappedSurvey, MappedSurvey, MappedSurvey> get copyWith =>
      _MappedSurveyCopyWithImpl<MappedSurvey, MappedSurvey>(
        this as MappedSurvey,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return MappedSurveyMapper.ensureInitialized().stringifyValue(
      this as MappedSurvey,
    );
  }

  @override
  bool operator ==(Object other) {
    return MappedSurveyMapper.ensureInitialized().equalsValue(
      this as MappedSurvey,
      other,
    );
  }

  @override
  int get hashCode {
    return MappedSurveyMapper.ensureInitialized().hashValue(
      this as MappedSurvey,
    );
  }
}

extension MappedSurveyValueCopy<$R, $Out>
    on ObjectCopyWith<$R, MappedSurvey, $Out> {
  MappedSurveyCopyWith<$R, MappedSurvey, $Out> get $asMappedSurvey =>
      $base.as((v, t, t2) => _MappedSurveyCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class MappedSurveyCopyWith<$R, $In extends MappedSurvey, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  SurveyCopyWith<$R, Survey, Survey> get survey;
  $R call({
    String? name,
    Survey? survey,
    String? surveyUrl,
    SurveyCardStatus? cardStatus,
    int? daysToOverdue,
    int? daysAfterOverdue,
  });
  MappedSurveyCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _MappedSurveyCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, MappedSurvey, $Out>
    implements MappedSurveyCopyWith<$R, MappedSurvey, $Out> {
  _MappedSurveyCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<MappedSurvey> $mapper =
      MappedSurveyMapper.ensureInitialized();
  @override
  SurveyCopyWith<$R, Survey, Survey> get survey =>
      $value.survey.copyWith.$chain((v) => call(survey: v));
  @override
  $R call({
    String? name,
    Survey? survey,
    String? surveyUrl,
    SurveyCardStatus? cardStatus,
    Object? daysToOverdue = $none,
    Object? daysAfterOverdue = $none,
  }) => $apply(
    FieldCopyWithData({
      if (name != null) #name: name,
      if (survey != null) #survey: survey,
      if (surveyUrl != null) #surveyUrl: surveyUrl,
      if (cardStatus != null) #cardStatus: cardStatus,
      if (daysToOverdue != $none) #daysToOverdue: daysToOverdue,
      if (daysAfterOverdue != $none) #daysAfterOverdue: daysAfterOverdue,
    }),
  );
  @override
  MappedSurvey $make(CopyWithData data) => MappedSurvey(
    name: data.get(#name, or: $value.name),
    survey: data.get(#survey, or: $value.survey),
    surveyUrl: data.get(#surveyUrl, or: $value.surveyUrl),
    cardStatus: data.get(#cardStatus, or: $value.cardStatus),
    daysToOverdue: data.get(#daysToOverdue, or: $value.daysToOverdue),
    daysAfterOverdue: data.get(#daysAfterOverdue, or: $value.daysAfterOverdue),
  );

  @override
  MappedSurveyCopyWith<$R2, MappedSurvey, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _MappedSurveyCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

