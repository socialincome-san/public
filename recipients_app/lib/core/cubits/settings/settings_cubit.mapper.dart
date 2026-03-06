// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'settings_cubit.dart';

class SettingsStateMapper extends ClassMapperBase<SettingsState> {
  SettingsStateMapper._();

  static SettingsStateMapper? _instance;
  static SettingsStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SettingsStateMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'SettingsState';

  static SettingsStatus _$status(SettingsState v) => v.status;
  static const Field<SettingsState, SettingsStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: SettingsStatus.initial,
  );
  static Locale _$locale(SettingsState v) => v.locale;
  static const Field<SettingsState, Locale> _f$locale = Field(
    'locale',
    _$locale,
  );
  static Exception? _$exception(SettingsState v) => v.exception;
  static const Field<SettingsState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<SettingsState> fields = const {
    #status: _f$status,
    #locale: _f$locale,
    #exception: _f$exception,
  };

  static SettingsState _instantiate(DecodingData data) {
    return SettingsState(
      status: data.dec(_f$status),
      locale: data.dec(_f$locale),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static SettingsState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<SettingsState>(map);
  }

  static SettingsState fromJson(String json) {
    return ensureInitialized().decodeJson<SettingsState>(json);
  }
}

mixin SettingsStateMappable {
  String toJson() {
    return SettingsStateMapper.ensureInitialized().encodeJson<SettingsState>(
      this as SettingsState,
    );
  }

  Map<String, dynamic> toMap() {
    return SettingsStateMapper.ensureInitialized().encodeMap<SettingsState>(
      this as SettingsState,
    );
  }

  SettingsStateCopyWith<SettingsState, SettingsState, SettingsState>
  get copyWith => _SettingsStateCopyWithImpl<SettingsState, SettingsState>(
    this as SettingsState,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return SettingsStateMapper.ensureInitialized().stringifyValue(
      this as SettingsState,
    );
  }

  @override
  bool operator ==(Object other) {
    return SettingsStateMapper.ensureInitialized().equalsValue(
      this as SettingsState,
      other,
    );
  }

  @override
  int get hashCode {
    return SettingsStateMapper.ensureInitialized().hashValue(
      this as SettingsState,
    );
  }
}

extension SettingsStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, SettingsState, $Out> {
  SettingsStateCopyWith<$R, SettingsState, $Out> get $asSettingsState =>
      $base.as((v, t, t2) => _SettingsStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class SettingsStateCopyWith<$R, $In extends SettingsState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({SettingsStatus? status, Locale? locale, Exception? exception});
  SettingsStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _SettingsStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, SettingsState, $Out>
    implements SettingsStateCopyWith<$R, SettingsState, $Out> {
  _SettingsStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<SettingsState> $mapper =
      SettingsStateMapper.ensureInitialized();
  @override
  $R call({
    SettingsStatus? status,
    Locale? locale,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (locale != null) #locale: locale,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  SettingsState $make(CopyWithData data) => SettingsState(
    status: data.get(#status, or: $value.status),
    locale: data.get(#locale, or: $value.locale),
    exception: data.get(#exception, or: $value.exception),
  );

  @override
  SettingsStateCopyWith<$R2, SettingsState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _SettingsStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

