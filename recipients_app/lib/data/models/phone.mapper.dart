// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
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

  static int _$phoneNumber(Phone v) => v.phoneNumber;
  static const Field<Phone, int> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
  );

  @override
  final MappableFields<Phone> fields = const {#phoneNumber: _f$phoneNumber};

  static Phone _instantiate(DecodingData data) {
    return Phone(data.dec(_f$phoneNumber));
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
  $R call({int? phoneNumber});
  PhoneCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PhoneCopyWithImpl<$R, $Out> extends ClassCopyWithBase<$R, Phone, $Out>
    implements PhoneCopyWith<$R, Phone, $Out> {
  _PhoneCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Phone> $mapper = PhoneMapper.ensureInitialized();
  @override
  $R call({int? phoneNumber}) => $apply(
    FieldCopyWithData({if (phoneNumber != null) #phoneNumber: phoneNumber}),
  );
  @override
  Phone $make(CopyWithData data) =>
      Phone(data.get(#phoneNumber, or: $value.phoneNumber));

  @override
  PhoneCopyWith<$R2, Phone, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _PhoneCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

