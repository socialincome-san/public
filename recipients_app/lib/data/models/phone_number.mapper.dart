// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'phone_number.dart';

class PhoneNumberMapper extends ClassMapperBase<PhoneNumber> {
  PhoneNumberMapper._();

  static PhoneNumberMapper? _instance;
  static PhoneNumberMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PhoneNumberMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'PhoneNumber';

  static String _$id(PhoneNumber v) => v.id;
  static const Field<PhoneNumber, String> _f$id = Field('id', _$id);
  static String _$userId(PhoneNumber v) => v.userId;
  static const Field<PhoneNumber, String> _f$userId = Field('userId', _$userId);
  static String _$phone(PhoneNumber v) => v.phone;
  static const Field<PhoneNumber, String> _f$phone = Field('phone', _$phone);
  static String _$type(PhoneNumber v) => v.type;
  static const Field<PhoneNumber, String> _f$type = Field('type', _$type);
  static bool _$isPrimary(PhoneNumber v) => v.isPrimary;
  static const Field<PhoneNumber, bool> _f$isPrimary = Field(
    'isPrimary',
    _$isPrimary,
  );

  @override
  final MappableFields<PhoneNumber> fields = const {
    #id: _f$id,
    #userId: _f$userId,
    #phone: _f$phone,
    #type: _f$type,
    #isPrimary: _f$isPrimary,
  };

  static PhoneNumber _instantiate(DecodingData data) {
    return PhoneNumber(
      id: data.dec(_f$id),
      userId: data.dec(_f$userId),
      phone: data.dec(_f$phone),
      type: data.dec(_f$type),
      isPrimary: data.dec(_f$isPrimary),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PhoneNumber fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PhoneNumber>(map);
  }

  static PhoneNumber fromJson(String json) {
    return ensureInitialized().decodeJson<PhoneNumber>(json);
  }
}

mixin PhoneNumberMappable {
  String toJson() {
    return PhoneNumberMapper.ensureInitialized().encodeJson<PhoneNumber>(
      this as PhoneNumber,
    );
  }

  Map<String, dynamic> toMap() {
    return PhoneNumberMapper.ensureInitialized().encodeMap<PhoneNumber>(
      this as PhoneNumber,
    );
  }

  PhoneNumberCopyWith<PhoneNumber, PhoneNumber, PhoneNumber> get copyWith =>
      _PhoneNumberCopyWithImpl<PhoneNumber, PhoneNumber>(
        this as PhoneNumber,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return PhoneNumberMapper.ensureInitialized().stringifyValue(
      this as PhoneNumber,
    );
  }

  @override
  bool operator ==(Object other) {
    return PhoneNumberMapper.ensureInitialized().equalsValue(
      this as PhoneNumber,
      other,
    );
  }

  @override
  int get hashCode {
    return PhoneNumberMapper.ensureInitialized().hashValue(this as PhoneNumber);
  }
}

extension PhoneNumberValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PhoneNumber, $Out> {
  PhoneNumberCopyWith<$R, PhoneNumber, $Out> get $asPhoneNumber =>
      $base.as((v, t, t2) => _PhoneNumberCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PhoneNumberCopyWith<$R, $In extends PhoneNumber, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    String? userId,
    String? phone,
    String? type,
    bool? isPrimary,
  });
  PhoneNumberCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PhoneNumberCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PhoneNumber, $Out>
    implements PhoneNumberCopyWith<$R, PhoneNumber, $Out> {
  _PhoneNumberCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PhoneNumber> $mapper =
      PhoneNumberMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    String? userId,
    String? phone,
    String? type,
    bool? isPrimary,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (userId != null) #userId: userId,
      if (phone != null) #phone: phone,
      if (type != null) #type: type,
      if (isPrimary != null) #isPrimary: isPrimary,
    }),
  );
  @override
  PhoneNumber $make(CopyWithData data) => PhoneNumber(
    id: data.get(#id, or: $value.id),
    userId: data.get(#userId, or: $value.userId),
    phone: data.get(#phone, or: $value.phone),
    type: data.get(#type, or: $value.type),
    isPrimary: data.get(#isPrimary, or: $value.isPrimary),
  );

  @override
  PhoneNumberCopyWith<$R2, PhoneNumber, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PhoneNumberCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

