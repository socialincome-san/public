// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'mobile_money_provider.dart';

class MobileMoneyProviderMapper extends ClassMapperBase<MobileMoneyProvider> {
  MobileMoneyProviderMapper._();

  static MobileMoneyProviderMapper? _instance;
  static MobileMoneyProviderMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = MobileMoneyProviderMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'MobileMoneyProvider';

  static String _$id(MobileMoneyProvider v) => v.id;
  static const Field<MobileMoneyProvider, String> _f$id = Field('id', _$id);
  static String _$name(MobileMoneyProvider v) => v.name;
  static const Field<MobileMoneyProvider, String> _f$name = Field(
    'name',
    _$name,
  );

  @override
  final MappableFields<MobileMoneyProvider> fields = const {
    #id: _f$id,
    #name: _f$name,
  };

  static MobileMoneyProvider _instantiate(DecodingData data) {
    return MobileMoneyProvider(id: data.dec(_f$id), name: data.dec(_f$name));
  }

  @override
  final Function instantiate = _instantiate;

  static MobileMoneyProvider fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<MobileMoneyProvider>(map);
  }

  static MobileMoneyProvider fromJson(String json) {
    return ensureInitialized().decodeJson<MobileMoneyProvider>(json);
  }
}

mixin MobileMoneyProviderMappable {
  String toJson() {
    return MobileMoneyProviderMapper.ensureInitialized()
        .encodeJson<MobileMoneyProvider>(this as MobileMoneyProvider);
  }

  Map<String, dynamic> toMap() {
    return MobileMoneyProviderMapper.ensureInitialized()
        .encodeMap<MobileMoneyProvider>(this as MobileMoneyProvider);
  }

  MobileMoneyProviderCopyWith<
    MobileMoneyProvider,
    MobileMoneyProvider,
    MobileMoneyProvider
  >
  get copyWith =>
      _MobileMoneyProviderCopyWithImpl<
        MobileMoneyProvider,
        MobileMoneyProvider
      >(this as MobileMoneyProvider, $identity, $identity);
  @override
  String toString() {
    return MobileMoneyProviderMapper.ensureInitialized().stringifyValue(
      this as MobileMoneyProvider,
    );
  }

  @override
  bool operator ==(Object other) {
    return MobileMoneyProviderMapper.ensureInitialized().equalsValue(
      this as MobileMoneyProvider,
      other,
    );
  }

  @override
  int get hashCode {
    return MobileMoneyProviderMapper.ensureInitialized().hashValue(
      this as MobileMoneyProvider,
    );
  }
}

extension MobileMoneyProviderValueCopy<$R, $Out>
    on ObjectCopyWith<$R, MobileMoneyProvider, $Out> {
  MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, $Out>
  get $asMobileMoneyProvider => $base.as(
    (v, t, t2) => _MobileMoneyProviderCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class MobileMoneyProviderCopyWith<
  $R,
  $In extends MobileMoneyProvider,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? id, String? name});
  MobileMoneyProviderCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _MobileMoneyProviderCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, MobileMoneyProvider, $Out>
    implements MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, $Out> {
  _MobileMoneyProviderCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<MobileMoneyProvider> $mapper =
      MobileMoneyProviderMapper.ensureInitialized();
  @override
  $R call({String? id, String? name}) => $apply(
    FieldCopyWithData({if (id != null) #id: id, if (name != null) #name: name}),
  );
  @override
  MobileMoneyProvider $make(CopyWithData data) => MobileMoneyProvider(
    id: data.get(#id, or: $value.id),
    name: data.get(#name, or: $value.name),
  );

  @override
  MobileMoneyProviderCopyWith<$R2, MobileMoneyProvider, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _MobileMoneyProviderCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

