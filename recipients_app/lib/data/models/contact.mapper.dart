// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'contact.dart';

class ContactMapper extends ClassMapperBase<Contact> {
  ContactMapper._();

  static ContactMapper? _instance;
  static ContactMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = ContactMapper._());
      PhoneMapper.ensureInitialized();
      GenderMapper.ensureInitialized();
      LanguageCodeMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Contact';

  static String _$id(Contact v) => v.id;
  static const Field<Contact, String> _f$id = Field('id', _$id);
  static String _$firstName(Contact v) => v.firstName;
  static const Field<Contact, String> _f$firstName = Field(
    'firstName',
    _$firstName,
  );
  static String _$lastName(Contact v) => v.lastName;
  static const Field<Contact, String> _f$lastName = Field(
    'lastName',
    _$lastName,
  );
  static String? _$callingName(Contact v) => v.callingName;
  static const Field<Contact, String> _f$callingName = Field(
    'callingName',
    _$callingName,
    opt: true,
  );
  static String? _$addressId(Contact v) => v.addressId;
  static const Field<Contact, String> _f$addressId = Field(
    'addressId',
    _$addressId,
    opt: true,
  );
  static String? _$phoneId(Contact v) => v.phoneId;
  static const Field<Contact, String> _f$phoneId = Field(
    'phoneId',
    _$phoneId,
    opt: true,
  );
  static Phone? _$phone(Contact v) => v.phone;
  static const Field<Contact, Phone> _f$phone = Field(
    'phone',
    _$phone,
    opt: true,
  );
  static String? _$email(Contact v) => v.email;
  static const Field<Contact, String> _f$email = Field(
    'email',
    _$email,
    opt: true,
  );
  static Gender? _$gender(Contact v) => v.gender;
  static const Field<Contact, Gender> _f$gender = Field(
    'gender',
    _$gender,
    opt: true,
  );
  static LanguageCode? _$language(Contact v) => v.language;
  static const Field<Contact, LanguageCode> _f$language = Field(
    'language',
    _$language,
    opt: true,
  );
  static String? _$dateOfBirth(Contact v) => v.dateOfBirth;
  static const Field<Contact, String> _f$dateOfBirth = Field(
    'dateOfBirth',
    _$dateOfBirth,
    opt: true,
  );
  static String? _$profession(Contact v) => v.profession;
  static const Field<Contact, String> _f$profession = Field(
    'profession',
    _$profession,
    opt: true,
  );
  static bool _$isInstitution(Contact v) => v.isInstitution;
  static const Field<Contact, bool> _f$isInstitution = Field(
    'isInstitution',
    _$isInstitution,
  );
  static String _$createdAt(Contact v) => v.createdAt;
  static const Field<Contact, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(Contact v) => v.updatedAt;
  static const Field<Contact, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<Contact> fields = const {
    #id: _f$id,
    #firstName: _f$firstName,
    #lastName: _f$lastName,
    #callingName: _f$callingName,
    #addressId: _f$addressId,
    #phoneId: _f$phoneId,
    #phone: _f$phone,
    #email: _f$email,
    #gender: _f$gender,
    #language: _f$language,
    #dateOfBirth: _f$dateOfBirth,
    #profession: _f$profession,
    #isInstitution: _f$isInstitution,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Contact _instantiate(DecodingData data) {
    return Contact(
      id: data.dec(_f$id),
      firstName: data.dec(_f$firstName),
      lastName: data.dec(_f$lastName),
      callingName: data.dec(_f$callingName),
      addressId: data.dec(_f$addressId),
      phoneId: data.dec(_f$phoneId),
      phone: data.dec(_f$phone),
      email: data.dec(_f$email),
      gender: data.dec(_f$gender),
      language: data.dec(_f$language),
      dateOfBirth: data.dec(_f$dateOfBirth),
      profession: data.dec(_f$profession),
      isInstitution: data.dec(_f$isInstitution),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Contact fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Contact>(map);
  }

  static Contact fromJson(String json) {
    return ensureInitialized().decodeJson<Contact>(json);
  }
}

mixin ContactMappable {
  String toJson() {
    return ContactMapper.ensureInitialized().encodeJson<Contact>(
      this as Contact,
    );
  }

  Map<String, dynamic> toMap() {
    return ContactMapper.ensureInitialized().encodeMap<Contact>(
      this as Contact,
    );
  }

  ContactCopyWith<Contact, Contact, Contact> get copyWith =>
      _ContactCopyWithImpl<Contact, Contact>(
        this as Contact,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return ContactMapper.ensureInitialized().stringifyValue(this as Contact);
  }

  @override
  bool operator ==(Object other) {
    return ContactMapper.ensureInitialized().equalsValue(
      this as Contact,
      other,
    );
  }

  @override
  int get hashCode {
    return ContactMapper.ensureInitialized().hashValue(this as Contact);
  }
}

extension ContactValueCopy<$R, $Out> on ObjectCopyWith<$R, Contact, $Out> {
  ContactCopyWith<$R, Contact, $Out> get $asContact =>
      $base.as((v, t, t2) => _ContactCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class ContactCopyWith<$R, $In extends Contact, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PhoneCopyWith<$R, Phone, Phone>? get phone;
  $R call({
    String? id,
    String? firstName,
    String? lastName,
    String? callingName,
    String? addressId,
    String? phoneId,
    Phone? phone,
    String? email,
    Gender? gender,
    LanguageCode? language,
    String? dateOfBirth,
    String? profession,
    bool? isInstitution,
    String? createdAt,
    String? updatedAt,
  });
  ContactCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _ContactCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Contact, $Out>
    implements ContactCopyWith<$R, Contact, $Out> {
  _ContactCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Contact> $mapper =
      ContactMapper.ensureInitialized();
  @override
  PhoneCopyWith<$R, Phone, Phone>? get phone =>
      $value.phone?.copyWith.$chain((v) => call(phone: v));
  @override
  $R call({
    String? id,
    String? firstName,
    String? lastName,
    Object? callingName = $none,
    Object? addressId = $none,
    Object? phoneId = $none,
    Object? phone = $none,
    Object? email = $none,
    Object? gender = $none,
    Object? language = $none,
    Object? dateOfBirth = $none,
    Object? profession = $none,
    bool? isInstitution,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (firstName != null) #firstName: firstName,
      if (lastName != null) #lastName: lastName,
      if (callingName != $none) #callingName: callingName,
      if (addressId != $none) #addressId: addressId,
      if (phoneId != $none) #phoneId: phoneId,
      if (phone != $none) #phone: phone,
      if (email != $none) #email: email,
      if (gender != $none) #gender: gender,
      if (language != $none) #language: language,
      if (dateOfBirth != $none) #dateOfBirth: dateOfBirth,
      if (profession != $none) #profession: profession,
      if (isInstitution != null) #isInstitution: isInstitution,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Contact $make(CopyWithData data) => Contact(
    id: data.get(#id, or: $value.id),
    firstName: data.get(#firstName, or: $value.firstName),
    lastName: data.get(#lastName, or: $value.lastName),
    callingName: data.get(#callingName, or: $value.callingName),
    addressId: data.get(#addressId, or: $value.addressId),
    phoneId: data.get(#phoneId, or: $value.phoneId),
    phone: data.get(#phone, or: $value.phone),
    email: data.get(#email, or: $value.email),
    gender: data.get(#gender, or: $value.gender),
    language: data.get(#language, or: $value.language),
    dateOfBirth: data.get(#dateOfBirth, or: $value.dateOfBirth),
    profession: data.get(#profession, or: $value.profession),
    isInstitution: data.get(#isInstitution, or: $value.isInstitution),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  ContactCopyWith<$R2, Contact, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _ContactCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

