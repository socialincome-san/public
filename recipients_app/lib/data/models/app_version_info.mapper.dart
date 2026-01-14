// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'app_version_info.dart';

class AppVersionInfoMapper extends ClassMapperBase<AppVersionInfo> {
  AppVersionInfoMapper._();

  static AppVersionInfoMapper? _instance;
  static AppVersionInfoMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = AppVersionInfoMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'AppVersionInfo';

  static String _$version(AppVersionInfo v) => v.version;
  static const Field<AppVersionInfo, String> _f$version = Field(
    'version',
    _$version,
  );
  static bool _$isOptional(AppVersionInfo v) => v.isOptional;
  static const Field<AppVersionInfo, bool> _f$isOptional = Field(
    'isOptional',
    _$isOptional,
    key: r'is_optional',
  );

  @override
  final MappableFields<AppVersionInfo> fields = const {
    #version: _f$version,
    #isOptional: _f$isOptional,
  };

  static AppVersionInfo _instantiate(DecodingData data) {
    return AppVersionInfo(
      version: data.dec(_f$version),
      isOptional: data.dec(_f$isOptional),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static AppVersionInfo fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<AppVersionInfo>(map);
  }

  static AppVersionInfo fromJson(String json) {
    return ensureInitialized().decodeJson<AppVersionInfo>(json);
  }
}

mixin AppVersionInfoMappable {
  String toJson() {
    return AppVersionInfoMapper.ensureInitialized().encodeJson<AppVersionInfo>(
      this as AppVersionInfo,
    );
  }

  Map<String, dynamic> toMap() {
    return AppVersionInfoMapper.ensureInitialized().encodeMap<AppVersionInfo>(
      this as AppVersionInfo,
    );
  }

  AppVersionInfoCopyWith<AppVersionInfo, AppVersionInfo, AppVersionInfo>
  get copyWith => _AppVersionInfoCopyWithImpl<AppVersionInfo, AppVersionInfo>(
    this as AppVersionInfo,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return AppVersionInfoMapper.ensureInitialized().stringifyValue(
      this as AppVersionInfo,
    );
  }

  @override
  bool operator ==(Object other) {
    return AppVersionInfoMapper.ensureInitialized().equalsValue(
      this as AppVersionInfo,
      other,
    );
  }

  @override
  int get hashCode {
    return AppVersionInfoMapper.ensureInitialized().hashValue(
      this as AppVersionInfo,
    );
  }
}

extension AppVersionInfoValueCopy<$R, $Out>
    on ObjectCopyWith<$R, AppVersionInfo, $Out> {
  AppVersionInfoCopyWith<$R, AppVersionInfo, $Out> get $asAppVersionInfo =>
      $base.as((v, t, t2) => _AppVersionInfoCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class AppVersionInfoCopyWith<$R, $In extends AppVersionInfo, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? version, bool? isOptional});
  AppVersionInfoCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _AppVersionInfoCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, AppVersionInfo, $Out>
    implements AppVersionInfoCopyWith<$R, AppVersionInfo, $Out> {
  _AppVersionInfoCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<AppVersionInfo> $mapper =
      AppVersionInfoMapper.ensureInitialized();
  @override
  $R call({String? version, bool? isOptional}) => $apply(
    FieldCopyWithData({
      if (version != null) #version: version,
      if (isOptional != null) #isOptional: isOptional,
    }),
  );
  @override
  AppVersionInfo $make(CopyWithData data) => AppVersionInfo(
    version: data.get(#version, or: $value.version),
    isOptional: data.get(#isOptional, or: $value.isOptional),
  );

  @override
  AppVersionInfoCopyWith<$R2, AppVersionInfo, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _AppVersionInfoCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

