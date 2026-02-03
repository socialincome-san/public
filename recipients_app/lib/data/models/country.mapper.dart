// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'country.dart';

class CountryMapper extends ClassMapperBase<Country> {
  CountryMapper._();

  static CountryMapper? _instance;
  static CountryMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = CountryMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'Country';

  static String _$isoCode(Country v) => v.isoCode;
  static const Field<Country, String> _f$isoCode = Field('isoCode', _$isoCode);

  @override
  final MappableFields<Country> fields = const {#isoCode: _f$isoCode};

  static Country _instantiate(DecodingData data) {
    return Country(isoCode: data.dec(_f$isoCode));
  }

  @override
  final Function instantiate = _instantiate;

  static Country fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Country>(map);
  }

  static Country fromJson(String json) {
    return ensureInitialized().decodeJson<Country>(json);
  }
}

mixin CountryMappable {
  String toJson() {
    return CountryMapper.ensureInitialized().encodeJson<Country>(
      this as Country,
    );
  }

  Map<String, dynamic> toMap() {
    return CountryMapper.ensureInitialized().encodeMap<Country>(
      this as Country,
    );
  }

  CountryCopyWith<Country, Country, Country> get copyWith =>
      _CountryCopyWithImpl<Country, Country>(
        this as Country,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return CountryMapper.ensureInitialized().stringifyValue(this as Country);
  }

  @override
  bool operator ==(Object other) {
    return CountryMapper.ensureInitialized().equalsValue(
      this as Country,
      other,
    );
  }

  @override
  int get hashCode {
    return CountryMapper.ensureInitialized().hashValue(this as Country);
  }
}

extension CountryValueCopy<$R, $Out> on ObjectCopyWith<$R, Country, $Out> {
  CountryCopyWith<$R, Country, $Out> get $asCountry =>
      $base.as((v, t, t2) => _CountryCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class CountryCopyWith<$R, $In extends Country, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? isoCode});
  CountryCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _CountryCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Country, $Out>
    implements CountryCopyWith<$R, Country, $Out> {
  _CountryCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Country> $mapper =
      CountryMapper.ensureInitialized();
  @override
  $R call({String? isoCode}) =>
      $apply(FieldCopyWithData({if (isoCode != null) #isoCode: isoCode}));
  @override
  Country $make(CopyWithData data) =>
      Country(isoCode: data.get(#isoCode, or: $value.isoCode));

  @override
  CountryCopyWith<$R2, Country, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _CountryCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

