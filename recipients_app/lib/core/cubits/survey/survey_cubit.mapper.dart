// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'survey_cubit.dart';

class SurveyStateStatusMapper extends EnumMapper<SurveyStateStatus> {
  SurveyStateStatusMapper._();

  static SurveyStateStatusMapper? _instance;
  static SurveyStateStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyStateStatusMapper._());
    }
    return _instance!;
  }

  static SurveyStateStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SurveyStateStatus decode(dynamic value) {
    switch (value) {
      case r'initial':
        return SurveyStateStatus.initial;
      case r'updatedSuccess':
        return SurveyStateStatus.updatedSuccess;
      case r'updatedFailure':
        return SurveyStateStatus.updatedFailure;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SurveyStateStatus self) {
    switch (self) {
      case SurveyStateStatus.initial:
        return r'initial';
      case SurveyStateStatus.updatedSuccess:
        return r'updatedSuccess';
      case SurveyStateStatus.updatedFailure:
        return r'updatedFailure';
    }
  }
}

extension SurveyStateStatusMapperExtension on SurveyStateStatus {
  String toValue() {
    SurveyStateStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SurveyStateStatus>(this) as String;
  }
}

class SurveyStateMapper extends ClassMapperBase<SurveyState> {
  SurveyStateMapper._();

  static SurveyStateMapper? _instance;
  static SurveyStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SurveyStateMapper._());
      SurveyStateStatusMapper.ensureInitialized();
      MappedSurveyMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'SurveyState';

  static SurveyStateStatus _$status(SurveyState v) => v.status;
  static const Field<SurveyState, SurveyStateStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: SurveyStateStatus.initial,
  );
  static List<MappedSurvey> _$mappedSurveys(SurveyState v) => v.mappedSurveys;
  static const Field<SurveyState, List<MappedSurvey>> _f$mappedSurveys = Field(
    'mappedSurveys',
    _$mappedSurveys,
    opt: true,
    def: const [],
  );
  static List<MappedSurvey> _$dashboardMappedSurveys(SurveyState v) =>
      v.dashboardMappedSurveys;
  static const Field<SurveyState, List<MappedSurvey>>
  _f$dashboardMappedSurveys = Field(
    'dashboardMappedSurveys',
    _$dashboardMappedSurveys,
    opt: true,
    def: const [],
  );

  @override
  final MappableFields<SurveyState> fields = const {
    #status: _f$status,
    #mappedSurveys: _f$mappedSurveys,
    #dashboardMappedSurveys: _f$dashboardMappedSurveys,
  };

  static SurveyState _instantiate(DecodingData data) {
    return SurveyState(
      status: data.dec(_f$status),
      mappedSurveys: data.dec(_f$mappedSurveys),
      dashboardMappedSurveys: data.dec(_f$dashboardMappedSurveys),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static SurveyState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<SurveyState>(map);
  }

  static SurveyState fromJson(String json) {
    return ensureInitialized().decodeJson<SurveyState>(json);
  }
}

mixin SurveyStateMappable {
  String toJson() {
    return SurveyStateMapper.ensureInitialized().encodeJson<SurveyState>(
      this as SurveyState,
    );
  }

  Map<String, dynamic> toMap() {
    return SurveyStateMapper.ensureInitialized().encodeMap<SurveyState>(
      this as SurveyState,
    );
  }

  SurveyStateCopyWith<SurveyState, SurveyState, SurveyState> get copyWith =>
      _SurveyStateCopyWithImpl<SurveyState, SurveyState>(
        this as SurveyState,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return SurveyStateMapper.ensureInitialized().stringifyValue(
      this as SurveyState,
    );
  }

  @override
  bool operator ==(Object other) {
    return SurveyStateMapper.ensureInitialized().equalsValue(
      this as SurveyState,
      other,
    );
  }

  @override
  int get hashCode {
    return SurveyStateMapper.ensureInitialized().hashValue(this as SurveyState);
  }
}

extension SurveyStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, SurveyState, $Out> {
  SurveyStateCopyWith<$R, SurveyState, $Out> get $asSurveyState =>
      $base.as((v, t, t2) => _SurveyStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class SurveyStateCopyWith<$R, $In extends SurveyState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  ListCopyWith<
    $R,
    MappedSurvey,
    MappedSurveyCopyWith<$R, MappedSurvey, MappedSurvey>
  >
  get mappedSurveys;
  ListCopyWith<
    $R,
    MappedSurvey,
    MappedSurveyCopyWith<$R, MappedSurvey, MappedSurvey>
  >
  get dashboardMappedSurveys;
  $R call({
    SurveyStateStatus? status,
    List<MappedSurvey>? mappedSurveys,
    List<MappedSurvey>? dashboardMappedSurveys,
  });
  SurveyStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _SurveyStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, SurveyState, $Out>
    implements SurveyStateCopyWith<$R, SurveyState, $Out> {
  _SurveyStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<SurveyState> $mapper =
      SurveyStateMapper.ensureInitialized();
  @override
  ListCopyWith<
    $R,
    MappedSurvey,
    MappedSurveyCopyWith<$R, MappedSurvey, MappedSurvey>
  >
  get mappedSurveys => ListCopyWith(
    $value.mappedSurveys,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(mappedSurveys: v),
  );
  @override
  ListCopyWith<
    $R,
    MappedSurvey,
    MappedSurveyCopyWith<$R, MappedSurvey, MappedSurvey>
  >
  get dashboardMappedSurveys => ListCopyWith(
    $value.dashboardMappedSurveys,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(dashboardMappedSurveys: v),
  );
  @override
  $R call({
    SurveyStateStatus? status,
    List<MappedSurvey>? mappedSurveys,
    List<MappedSurvey>? dashboardMappedSurveys,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (mappedSurveys != null) #mappedSurveys: mappedSurveys,
      if (dashboardMappedSurveys != null)
        #dashboardMappedSurveys: dashboardMappedSurveys,
    }),
  );
  @override
  SurveyState $make(CopyWithData data) => SurveyState(
    status: data.get(#status, or: $value.status),
    mappedSurveys: data.get(#mappedSurveys, or: $value.mappedSurveys),
    dashboardMappedSurveys: data.get(
      #dashboardMappedSurveys,
      or: $value.dashboardMappedSurveys,
    ),
  );

  @override
  SurveyStateCopyWith<$R2, SurveyState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _SurveyStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

