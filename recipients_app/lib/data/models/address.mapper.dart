// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'address.dart';

class AddressMapper extends ClassMapperBase<Address> {
  AddressMapper._();

  static AddressMapper? _instance;
  static AddressMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = AddressMapper._());
      ContactMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Address';

  static String _$id(Address v) => v.id;
  static const Field<Address, String> _f$id = Field('id', _$id);
  static String _$userId(Address v) => v.userId;
  static const Field<Address, String> _f$userId = Field('userId', _$userId);
  static String _$street(Address v) => v.street;
  static const Field<Address, String> _f$street = Field('street', _$street);
  static String _$number(Address v) => v.number;
  static const Field<Address, String> _f$number = Field('number', _$number);
  static String _$city(Address v) => v.city;
  static const Field<Address, String> _f$city = Field('city', _$city);
  static int _$zip(Address v) => v.zip;
  static const Field<Address, int> _f$zip = Field('zip', _$zip);
  static String _$country(Address v) => v.country;
  static const Field<Address, String> _f$country = Field('country', _$country);
  static Contact _$contact(Address v) => v.contact;
  static const Field<Address, Contact> _f$contact = Field('contact', _$contact);

  @override
  final MappableFields<Address> fields = const {
    #id: _f$id,
    #userId: _f$userId,
    #street: _f$street,
    #number: _f$number,
    #city: _f$city,
    #zip: _f$zip,
    #country: _f$country,
    #contact: _f$contact,
  };

  static Address _instantiate(DecodingData data) {
    return Address(
      id: data.dec(_f$id),
      userId: data.dec(_f$userId),
      street: data.dec(_f$street),
      number: data.dec(_f$number),
      city: data.dec(_f$city),
      zip: data.dec(_f$zip),
      country: data.dec(_f$country),
      contact: data.dec(_f$contact),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Address fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Address>(map);
  }

  static Address fromJson(String json) {
    return ensureInitialized().decodeJson<Address>(json);
  }
}

mixin AddressMappable {
  String toJson() {
    return AddressMapper.ensureInitialized().encodeJson<Address>(
      this as Address,
    );
  }

  Map<String, dynamic> toMap() {
    return AddressMapper.ensureInitialized().encodeMap<Address>(
      this as Address,
    );
  }

  AddressCopyWith<Address, Address, Address> get copyWith =>
      _AddressCopyWithImpl<Address, Address>(
        this as Address,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return AddressMapper.ensureInitialized().stringifyValue(this as Address);
  }

  @override
  bool operator ==(Object other) {
    return AddressMapper.ensureInitialized().equalsValue(
      this as Address,
      other,
    );
  }

  @override
  int get hashCode {
    return AddressMapper.ensureInitialized().hashValue(this as Address);
  }
}

extension AddressValueCopy<$R, $Out> on ObjectCopyWith<$R, Address, $Out> {
  AddressCopyWith<$R, Address, $Out> get $asAddress =>
      $base.as((v, t, t2) => _AddressCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class AddressCopyWith<$R, $In extends Address, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  ContactCopyWith<$R, Contact, Contact> get contact;
  $R call({
    String? id,
    String? userId,
    String? street,
    String? number,
    String? city,
    int? zip,
    String? country,
    Contact? contact,
  });
  AddressCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _AddressCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Address, $Out>
    implements AddressCopyWith<$R, Address, $Out> {
  _AddressCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Address> $mapper =
      AddressMapper.ensureInitialized();
  @override
  ContactCopyWith<$R, Contact, Contact> get contact =>
      $value.contact.copyWith.$chain((v) => call(contact: v));
  @override
  $R call({
    String? id,
    String? userId,
    String? street,
    String? number,
    String? city,
    int? zip,
    String? country,
    Contact? contact,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (userId != null) #userId: userId,
      if (street != null) #street: street,
      if (number != null) #number: number,
      if (city != null) #city: city,
      if (zip != null) #zip: zip,
      if (country != null) #country: country,
      if (contact != null) #contact: contact,
    }),
  );
  @override
  Address $make(CopyWithData data) => Address(
    id: data.get(#id, or: $value.id),
    userId: data.get(#userId, or: $value.userId),
    street: data.get(#street, or: $value.street),
    number: data.get(#number, or: $value.number),
    city: data.get(#city, or: $value.city),
    zip: data.get(#zip, or: $value.zip),
    country: data.get(#country, or: $value.country),
    contact: data.get(#contact, or: $value.contact),
  );

  @override
  AddressCopyWith<$R2, Address, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _AddressCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

