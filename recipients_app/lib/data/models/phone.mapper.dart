// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'phone.dart';

class PhoneMapper extends ClassMapperBase<Phone> {
  PhoneMapper._();

  static PhoneMapper? _instance;
  static PhoneMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PhoneMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'Phone';

  static String _$id(Phone v) => v.id;
  static const Field<Phone, String> _f$id = Field('id', _$id);
  static String _$number(Phone v) => v.number;
  static const Field<Phone, String> _f$number = Field('number', _$number);
  static bool _$hasWhatsApp(Phone v) => v.hasWhatsApp;
  static const Field<Phone, bool> _f$hasWhatsApp = Field(
    'hasWhatsApp',
    _$hasWhatsApp,
  );
  static String _$createdAt(Phone v) => v.createdAt;
  static const Field<Phone, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(Phone v) => v.updatedAt;
  static const Field<Phone, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<Phone> fields = const {
    #id: _f$id,
    #number: _f$number,
    #hasWhatsApp: _f$hasWhatsApp,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Phone _instantiate(DecodingData data) {
    return Phone(
      id: data.dec(_f$id),
      number: data.dec(_f$number),
      hasWhatsApp: data.dec(_f$hasWhatsApp),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Phone fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Phone>(map);
  }

  static Phone fromJson(String json) {
    return ensureInitialized().decodeJson<Phone>(json);
  }
}

mixin PhoneMappable {
  String toJson() {
    return PhoneMapper.ensureInitialized().encodeJson<Phone>(this as Phone);
  }

  Map<String, dynamic> toMap() {
    return PhoneMapper.ensureInitialized().encodeMap<Phone>(this as Phone);
  }

  PhoneCopyWith<Phone, Phone, Phone> get copyWith =>
      _PhoneCopyWithImpl<Phone, Phone>(this as Phone, $identity, $identity);
  @override
  String toString() {
    return PhoneMapper.ensureInitialized().stringifyValue(this as Phone);
  }

  @override
  bool operator ==(Object other) {
    return PhoneMapper.ensureInitialized().equalsValue(this as Phone, other);
  }

  @override
  int get hashCode {
    return PhoneMapper.ensureInitialized().hashValue(this as Phone);
  }
}

extension PhoneValueCopy<$R, $Out> on ObjectCopyWith<$R, Phone, $Out> {
  PhoneCopyWith<$R, Phone, $Out> get $asPhone =>
      $base.as((v, t, t2) => _PhoneCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PhoneCopyWith<$R, $In extends Phone, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    String? number,
    bool? hasWhatsApp,
    String? createdAt,
    String? updatedAt,
  });
  PhoneCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PhoneCopyWithImpl<$R, $Out> extends ClassCopyWithBase<$R, Phone, $Out>
    implements PhoneCopyWith<$R, Phone, $Out> {
  _PhoneCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Phone> $mapper = PhoneMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    String? number,
    bool? hasWhatsApp,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (number != null) #number: number,
      if (hasWhatsApp != null) #hasWhatsApp: hasWhatsApp,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Phone $make(CopyWithData data) => Phone(
    id: data.get(#id, or: $value.id),
    number: data.get(#number, or: $value.number),
    hasWhatsApp: data.get(#hasWhatsApp, or: $value.hasWhatsApp),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  PhoneCopyWith<$R2, Phone, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _PhoneCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

