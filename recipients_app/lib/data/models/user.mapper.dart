// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'user.dart';

class UserMapper extends ClassMapperBase<User> {
  UserMapper._();

  static UserMapper? _instance;
  static UserMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = UserMapper._());
      GenderMapper.ensureInitialized();
      LanguageCodeMapper.ensureInitialized();
      CurrencyMapper.ensureInitialized();
      RecipientMapper.ensureInitialized();
      AddressMapper.ensureInitialized();
      LocalPartnerMapper.ensureInitialized();
      PhoneNumberMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'User';

  static String _$id(User v) => v.id;
  static const Field<User, String> _f$id = Field('id', _$id);
  static String _$email(User v) => v.email;
  static const Field<User, String> _f$email = Field('email', _$email);
  static String? _$authUserId(User v) => v.authUserId;
  static const Field<User, String> _f$authUserId = Field(
    'authUserId',
    _$authUserId,
  );
  static String _$firstName(User v) => v.firstName;
  static const Field<User, String> _f$firstName = Field(
    'firstName',
    _$firstName,
  );
  static String _$lastName(User v) => v.lastName;
  static const Field<User, String> _f$lastName = Field('lastName', _$lastName);
  static Gender _$gender(User v) => v.gender;
  static const Field<User, Gender> _f$gender = Field('gender', _$gender);
  static LanguageCode? _$languageCode(User v) => v.languageCode;
  static const Field<User, LanguageCode> _f$languageCode = Field(
    'languageCode',
    _$languageCode,
  );
  static Currency? _$currency(User v) => v.currency;
  static const Field<User, Currency> _f$currency = Field(
    'currency',
    _$currency,
  );
  static DateTime? _$dateOfBirth(User v) => v.dateOfBirth;
  static const Field<User, DateTime> _f$dateOfBirth = Field(
    'dateOfBirth',
    _$dateOfBirth,
  );
  static Recipient? _$recipient(User v) => v.recipient;
  static const Field<User, Recipient> _f$recipient = Field(
    'recipient',
    _$recipient,
  );
  static List<Address> _$address(User v) => v.address;
  static const Field<User, List<Address>> _f$address = Field(
    'address',
    _$address,
  );
  static LocalPartner? _$localPartner(User v) => v.localPartner;
  static const Field<User, LocalPartner> _f$localPartner = Field(
    'localPartner',
    _$localPartner,
  );
  static List<PhoneNumber> _$phoneNumber(User v) => v.phoneNumber;
  static const Field<User, List<PhoneNumber>> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
  );

  @override
  final MappableFields<User> fields = const {
    #id: _f$id,
    #email: _f$email,
    #authUserId: _f$authUserId,
    #firstName: _f$firstName,
    #lastName: _f$lastName,
    #gender: _f$gender,
    #languageCode: _f$languageCode,
    #currency: _f$currency,
    #dateOfBirth: _f$dateOfBirth,
    #recipient: _f$recipient,
    #address: _f$address,
    #localPartner: _f$localPartner,
    #phoneNumber: _f$phoneNumber,
  };

  static User _instantiate(DecodingData data) {
    return User(
      id: data.dec(_f$id),
      email: data.dec(_f$email),
      authUserId: data.dec(_f$authUserId),
      firstName: data.dec(_f$firstName),
      lastName: data.dec(_f$lastName),
      gender: data.dec(_f$gender),
      languageCode: data.dec(_f$languageCode),
      currency: data.dec(_f$currency),
      dateOfBirth: data.dec(_f$dateOfBirth),
      recipient: data.dec(_f$recipient),
      address: data.dec(_f$address),
      localPartner: data.dec(_f$localPartner),
      phoneNumber: data.dec(_f$phoneNumber),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static User fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<User>(map);
  }

  static User fromJson(String json) {
    return ensureInitialized().decodeJson<User>(json);
  }
}

mixin UserMappable {
  String toJson() {
    return UserMapper.ensureInitialized().encodeJson<User>(this as User);
  }

  Map<String, dynamic> toMap() {
    return UserMapper.ensureInitialized().encodeMap<User>(this as User);
  }

  UserCopyWith<User, User, User> get copyWith =>
      _UserCopyWithImpl<User, User>(this as User, $identity, $identity);
  @override
  String toString() {
    return UserMapper.ensureInitialized().stringifyValue(this as User);
  }

  @override
  bool operator ==(Object other) {
    return UserMapper.ensureInitialized().equalsValue(this as User, other);
  }

  @override
  int get hashCode {
    return UserMapper.ensureInitialized().hashValue(this as User);
  }
}

extension UserValueCopy<$R, $Out> on ObjectCopyWith<$R, User, $Out> {
  UserCopyWith<$R, User, $Out> get $asUser =>
      $base.as((v, t, t2) => _UserCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class UserCopyWith<$R, $In extends User, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  RecipientCopyWith<$R, Recipient, Recipient>? get recipient;
  ListCopyWith<$R, Address, AddressCopyWith<$R, Address, Address>> get address;
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner>? get localPartner;
  ListCopyWith<
    $R,
    PhoneNumber,
    PhoneNumberCopyWith<$R, PhoneNumber, PhoneNumber>
  >
  get phoneNumber;
  $R call({
    String? id,
    String? email,
    String? authUserId,
    String? firstName,
    String? lastName,
    Gender? gender,
    LanguageCode? languageCode,
    Currency? currency,
    DateTime? dateOfBirth,
    Recipient? recipient,
    List<Address>? address,
    LocalPartner? localPartner,
    List<PhoneNumber>? phoneNumber,
  });
  UserCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _UserCopyWithImpl<$R, $Out> extends ClassCopyWithBase<$R, User, $Out>
    implements UserCopyWith<$R, User, $Out> {
  _UserCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<User> $mapper = UserMapper.ensureInitialized();
  @override
  RecipientCopyWith<$R, Recipient, Recipient>? get recipient =>
      $value.recipient?.copyWith.$chain((v) => call(recipient: v));
  @override
  ListCopyWith<$R, Address, AddressCopyWith<$R, Address, Address>>
  get address => ListCopyWith(
    $value.address,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(address: v),
  );
  @override
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner>? get localPartner =>
      $value.localPartner?.copyWith.$chain((v) => call(localPartner: v));
  @override
  ListCopyWith<
    $R,
    PhoneNumber,
    PhoneNumberCopyWith<$R, PhoneNumber, PhoneNumber>
  >
  get phoneNumber => ListCopyWith(
    $value.phoneNumber,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(phoneNumber: v),
  );
  @override
  $R call({
    String? id,
    String? email,
    Object? authUserId = $none,
    String? firstName,
    String? lastName,
    Gender? gender,
    Object? languageCode = $none,
    Object? currency = $none,
    Object? dateOfBirth = $none,
    Object? recipient = $none,
    List<Address>? address,
    Object? localPartner = $none,
    List<PhoneNumber>? phoneNumber,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (email != null) #email: email,
      if (authUserId != $none) #authUserId: authUserId,
      if (firstName != null) #firstName: firstName,
      if (lastName != null) #lastName: lastName,
      if (gender != null) #gender: gender,
      if (languageCode != $none) #languageCode: languageCode,
      if (currency != $none) #currency: currency,
      if (dateOfBirth != $none) #dateOfBirth: dateOfBirth,
      if (recipient != $none) #recipient: recipient,
      if (address != null) #address: address,
      if (localPartner != $none) #localPartner: localPartner,
      if (phoneNumber != null) #phoneNumber: phoneNumber,
    }),
  );
  @override
  User $make(CopyWithData data) => User(
    id: data.get(#id, or: $value.id),
    email: data.get(#email, or: $value.email),
    authUserId: data.get(#authUserId, or: $value.authUserId),
    firstName: data.get(#firstName, or: $value.firstName),
    lastName: data.get(#lastName, or: $value.lastName),
    gender: data.get(#gender, or: $value.gender),
    languageCode: data.get(#languageCode, or: $value.languageCode),
    currency: data.get(#currency, or: $value.currency),
    dateOfBirth: data.get(#dateOfBirth, or: $value.dateOfBirth),
    recipient: data.get(#recipient, or: $value.recipient),
    address: data.get(#address, or: $value.address),
    localPartner: data.get(#localPartner, or: $value.localPartner),
    phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
  );

  @override
  UserCopyWith<$R2, User, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _UserCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

