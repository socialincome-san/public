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
      ProgramMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Organization';

  static String _$id(Organization v) => v.id;
  static const Field<Organization, String> _f$id = Field('id', _$id);
  static String _$name(Organization v) => v.name;
  static const Field<Organization, String> _f$name = Field('name', _$name);
  static List<Program> _$operatedPrograms(Organization v) => v.operatedPrograms;
  static const Field<Organization, List<Program>> _f$operatedPrograms = Field(
    'operatedPrograms',
    _$operatedPrograms,
  );
  static List<Program> _$viewedPrograms(Organization v) => v.viewedPrograms;
  static const Field<Organization, List<Program>> _f$viewedPrograms = Field(
    'viewedPrograms',
    _$viewedPrograms,
  );

  @override
  final MappableFields<Organization> fields = const {
    #id: _f$id,
    #name: _f$name,
    #operatedPrograms: _f$operatedPrograms,
    #viewedPrograms: _f$viewedPrograms,
  };

  static Organization _instantiate(DecodingData data) {
    return Organization(
      id: data.dec(_f$id),
      name: data.dec(_f$name),
      operatedPrograms: data.dec(_f$operatedPrograms),
      viewedPrograms: data.dec(_f$viewedPrograms),
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
  ListCopyWith<$R, Program, ProgramCopyWith<$R, Program, Program>>
  get operatedPrograms;
  ListCopyWith<$R, Program, ProgramCopyWith<$R, Program, Program>>
  get viewedPrograms;
  $R call({
    String? id,
    String? name,
    List<Program>? operatedPrograms,
    List<Program>? viewedPrograms,
  });
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
  ListCopyWith<$R, Program, ProgramCopyWith<$R, Program, Program>>
  get operatedPrograms => ListCopyWith(
    $value.operatedPrograms,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(operatedPrograms: v),
  );
  @override
  ListCopyWith<$R, Program, ProgramCopyWith<$R, Program, Program>>
  get viewedPrograms => ListCopyWith(
    $value.viewedPrograms,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(viewedPrograms: v),
  );
  @override
  $R call({
    String? id,
    String? name,
    List<Program>? operatedPrograms,
    List<Program>? viewedPrograms,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (name != null) #name: name,
      if (operatedPrograms != null) #operatedPrograms: operatedPrograms,
      if (viewedPrograms != null) #viewedPrograms: viewedPrograms,
    }),
  );
  @override
  Organization $make(CopyWithData data) => Organization(
    id: data.get(#id, or: $value.id),
    name: data.get(#name, or: $value.name),
    operatedPrograms: data.get(#operatedPrograms, or: $value.operatedPrograms),
    viewedPrograms: data.get(#viewedPrograms, or: $value.viewedPrograms),
  );

  @override
  OrganizationCopyWith<$R2, Organization, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _OrganizationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

