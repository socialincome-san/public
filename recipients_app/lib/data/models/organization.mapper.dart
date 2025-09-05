// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'organization.dart';

class OrganizationMapper extends ClassMapperBase<Organization> {
  OrganizationMapper._();

  static OrganizationMapper? _instance;
  static OrganizationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = OrganizationMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'Organization';

  static String _$name(Organization v) => v.name;
  static const Field<Organization, String> _f$name = Field('name', _$name);
  static String? _$contactName(Organization v) => v.contactName;
  static const Field<Organization, String> _f$contactName = Field(
    'contactName',
    _$contactName,
    opt: true,
  );
  static String? _$contactNumber(Organization v) => v.contactNumber;
  static const Field<Organization, String> _f$contactNumber = Field(
    'contactNumber',
    _$contactNumber,
    opt: true,
  );

  @override
  final MappableFields<Organization> fields = const {
    #name: _f$name,
    #contactName: _f$contactName,
    #contactNumber: _f$contactNumber,
  };

  static Organization _instantiate(DecodingData data) {
    return Organization(
      name: data.dec(_f$name),
      contactName: data.dec(_f$contactName),
      contactNumber: data.dec(_f$contactNumber),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Organization fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Organization>(map);
  }

  static Organization fromJson(String json) {
    return ensureInitialized().decodeJson<Organization>(json);
  }
}

mixin OrganizationMappable {
  String toJson() {
    return OrganizationMapper.ensureInitialized().encodeJson<Organization>(
      this as Organization,
    );
  }

  Map<String, dynamic> toMap() {
    return OrganizationMapper.ensureInitialized().encodeMap<Organization>(
      this as Organization,
    );
  }

  OrganizationCopyWith<Organization, Organization, Organization> get copyWith =>
      _OrganizationCopyWithImpl<Organization, Organization>(
        this as Organization,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return OrganizationMapper.ensureInitialized().stringifyValue(
      this as Organization,
    );
  }

  @override
  bool operator ==(Object other) {
    return OrganizationMapper.ensureInitialized().equalsValue(
      this as Organization,
      other,
    );
  }

  @override
  int get hashCode {
    return OrganizationMapper.ensureInitialized().hashValue(
      this as Organization,
    );
  }
}

extension OrganizationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, Organization, $Out> {
  OrganizationCopyWith<$R, Organization, $Out> get $asOrganization =>
      $base.as((v, t, t2) => _OrganizationCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class OrganizationCopyWith<$R, $In extends Organization, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? name, String? contactName, String? contactNumber});
  OrganizationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _OrganizationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Organization, $Out>
    implements OrganizationCopyWith<$R, Organization, $Out> {
  _OrganizationCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Organization> $mapper =
      OrganizationMapper.ensureInitialized();
  @override
  $R call({
    String? name,
    Object? contactName = $none,
    Object? contactNumber = $none,
  }) => $apply(
    FieldCopyWithData({
      if (name != null) #name: name,
      if (contactName != $none) #contactName: contactName,
      if (contactNumber != $none) #contactNumber: contactNumber,
    }),
  );
  @override
  Organization $make(CopyWithData data) => Organization(
    name: data.get(#name, or: $value.name),
    contactName: data.get(#contactName, or: $value.contactName),
    contactNumber: data.get(#contactNumber, or: $value.contactNumber),
  );

  @override
  OrganizationCopyWith<$R2, Organization, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _OrganizationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

