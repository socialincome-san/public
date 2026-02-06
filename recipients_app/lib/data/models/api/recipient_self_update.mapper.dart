// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'recipient_self_update.dart';

class RecipientSelfUpdateMapper extends ClassMapperBase<RecipientSelfUpdate> {
  RecipientSelfUpdateMapper._();

  static RecipientSelfUpdateMapper? _instance;
  static RecipientSelfUpdateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RecipientSelfUpdateMapper._());
      GenderMapper.ensureInitialized();
      LanguageCodeMapper.ensureInitialized();
      PaymentProviderMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'RecipientSelfUpdate';

  static String? _$firstName(RecipientSelfUpdate v) => v.firstName;
  static const Field<RecipientSelfUpdate, String> _f$firstName = Field(
    'firstName',
    _$firstName,
    opt: true,
  );
  static String? _$lastName(RecipientSelfUpdate v) => v.lastName;
  static const Field<RecipientSelfUpdate, String> _f$lastName = Field(
    'lastName',
    _$lastName,
    opt: true,
  );
  static String? _$callingName(RecipientSelfUpdate v) => v.callingName;
  static const Field<RecipientSelfUpdate, String> _f$callingName = Field(
    'callingName',
    _$callingName,
    opt: true,
  );
  static Gender? _$gender(RecipientSelfUpdate v) => v.gender;
  static const Field<RecipientSelfUpdate, Gender> _f$gender = Field(
    'gender',
    _$gender,
    opt: true,
  );
  static String? _$dateOfBirth(RecipientSelfUpdate v) => v.dateOfBirth;
  static const Field<RecipientSelfUpdate, String> _f$dateOfBirth = Field(
    'dateOfBirth',
    _$dateOfBirth,
    opt: true,
  );
  static LanguageCode? _$language(RecipientSelfUpdate v) => v.language;
  static const Field<RecipientSelfUpdate, LanguageCode> _f$language = Field(
    'language',
    _$language,
    opt: true,
  );
  static String? _$email(RecipientSelfUpdate v) => v.email;
  static const Field<RecipientSelfUpdate, String> _f$email = Field(
    'email',
    _$email,
    opt: true,
  );
  static String? _$contactPhone(RecipientSelfUpdate v) => v.contactPhone;
  static const Field<RecipientSelfUpdate, String> _f$contactPhone = Field(
    'contactPhone',
    _$contactPhone,
    opt: true,
  );
  static String? _$paymentPhone(RecipientSelfUpdate v) => v.paymentPhone;
  static const Field<RecipientSelfUpdate, String> _f$paymentPhone = Field(
    'paymentPhone',
    _$paymentPhone,
    opt: true,
  );
  static PaymentProvider? _$paymentProvider(RecipientSelfUpdate v) =>
      v.paymentProvider;
  static const Field<RecipientSelfUpdate, PaymentProvider> _f$paymentProvider =
      Field('paymentProvider', _$paymentProvider, opt: true);
  static String? _$successorName(RecipientSelfUpdate v) => v.successorName;
  static const Field<RecipientSelfUpdate, String> _f$successorName = Field(
    'successorName',
    _$successorName,
    opt: true,
  );
  static bool? _$termsAccepted(RecipientSelfUpdate v) => v.termsAccepted;
  static const Field<RecipientSelfUpdate, bool> _f$termsAccepted = Field(
    'termsAccepted',
    _$termsAccepted,
    opt: true,
  );

  @override
  final MappableFields<RecipientSelfUpdate> fields = const {
    #firstName: _f$firstName,
    #lastName: _f$lastName,
    #callingName: _f$callingName,
    #gender: _f$gender,
    #dateOfBirth: _f$dateOfBirth,
    #language: _f$language,
    #email: _f$email,
    #contactPhone: _f$contactPhone,
    #paymentPhone: _f$paymentPhone,
    #paymentProvider: _f$paymentProvider,
    #successorName: _f$successorName,
    #termsAccepted: _f$termsAccepted,
  };
  @override
  final bool ignoreNull = true;

  static RecipientSelfUpdate _instantiate(DecodingData data) {
    return RecipientSelfUpdate(
      firstName: data.dec(_f$firstName),
      lastName: data.dec(_f$lastName),
      callingName: data.dec(_f$callingName),
      gender: data.dec(_f$gender),
      dateOfBirth: data.dec(_f$dateOfBirth),
      language: data.dec(_f$language),
      email: data.dec(_f$email),
      contactPhone: data.dec(_f$contactPhone),
      paymentPhone: data.dec(_f$paymentPhone),
      paymentProvider: data.dec(_f$paymentProvider),
      successorName: data.dec(_f$successorName),
      termsAccepted: data.dec(_f$termsAccepted),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static RecipientSelfUpdate fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<RecipientSelfUpdate>(map);
  }

  static RecipientSelfUpdate fromJson(String json) {
    return ensureInitialized().decodeJson<RecipientSelfUpdate>(json);
  }
}

mixin RecipientSelfUpdateMappable {
  String toJson() {
    return RecipientSelfUpdateMapper.ensureInitialized()
        .encodeJson<RecipientSelfUpdate>(this as RecipientSelfUpdate);
  }

  Map<String, dynamic> toMap() {
    return RecipientSelfUpdateMapper.ensureInitialized()
        .encodeMap<RecipientSelfUpdate>(this as RecipientSelfUpdate);
  }

  RecipientSelfUpdateCopyWith<
    RecipientSelfUpdate,
    RecipientSelfUpdate,
    RecipientSelfUpdate
  >
  get copyWith =>
      _RecipientSelfUpdateCopyWithImpl<
        RecipientSelfUpdate,
        RecipientSelfUpdate
      >(this as RecipientSelfUpdate, $identity, $identity);
  @override
  String toString() {
    return RecipientSelfUpdateMapper.ensureInitialized().stringifyValue(
      this as RecipientSelfUpdate,
    );
  }

  @override
  bool operator ==(Object other) {
    return RecipientSelfUpdateMapper.ensureInitialized().equalsValue(
      this as RecipientSelfUpdate,
      other,
    );
  }

  @override
  int get hashCode {
    return RecipientSelfUpdateMapper.ensureInitialized().hashValue(
      this as RecipientSelfUpdate,
    );
  }
}

extension RecipientSelfUpdateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, RecipientSelfUpdate, $Out> {
  RecipientSelfUpdateCopyWith<$R, RecipientSelfUpdate, $Out>
  get $asRecipientSelfUpdate => $base.as(
    (v, t, t2) => _RecipientSelfUpdateCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class RecipientSelfUpdateCopyWith<
  $R,
  $In extends RecipientSelfUpdate,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? firstName,
    String? lastName,
    String? callingName,
    Gender? gender,
    String? dateOfBirth,
    LanguageCode? language,
    String? email,
    String? contactPhone,
    String? paymentPhone,
    PaymentProvider? paymentProvider,
    String? successorName,
    bool? termsAccepted,
  });
  RecipientSelfUpdateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _RecipientSelfUpdateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, RecipientSelfUpdate, $Out>
    implements RecipientSelfUpdateCopyWith<$R, RecipientSelfUpdate, $Out> {
  _RecipientSelfUpdateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<RecipientSelfUpdate> $mapper =
      RecipientSelfUpdateMapper.ensureInitialized();
  @override
  $R call({
    Object? firstName = $none,
    Object? lastName = $none,
    Object? callingName = $none,
    Object? gender = $none,
    Object? dateOfBirth = $none,
    Object? language = $none,
    Object? email = $none,
    Object? contactPhone = $none,
    Object? paymentPhone = $none,
    Object? paymentProvider = $none,
    Object? successorName = $none,
    Object? termsAccepted = $none,
  }) => $apply(
    FieldCopyWithData({
      if (firstName != $none) #firstName: firstName,
      if (lastName != $none) #lastName: lastName,
      if (callingName != $none) #callingName: callingName,
      if (gender != $none) #gender: gender,
      if (dateOfBirth != $none) #dateOfBirth: dateOfBirth,
      if (language != $none) #language: language,
      if (email != $none) #email: email,
      if (contactPhone != $none) #contactPhone: contactPhone,
      if (paymentPhone != $none) #paymentPhone: paymentPhone,
      if (paymentProvider != $none) #paymentProvider: paymentProvider,
      if (successorName != $none) #successorName: successorName,
      if (termsAccepted != $none) #termsAccepted: termsAccepted,
    }),
  );
  @override
  RecipientSelfUpdate $make(CopyWithData data) => RecipientSelfUpdate(
    firstName: data.get(#firstName, or: $value.firstName),
    lastName: data.get(#lastName, or: $value.lastName),
    callingName: data.get(#callingName, or: $value.callingName),
    gender: data.get(#gender, or: $value.gender),
    dateOfBirth: data.get(#dateOfBirth, or: $value.dateOfBirth),
    language: data.get(#language, or: $value.language),
    email: data.get(#email, or: $value.email),
    contactPhone: data.get(#contactPhone, or: $value.contactPhone),
    paymentPhone: data.get(#paymentPhone, or: $value.paymentPhone),
    paymentProvider: data.get(#paymentProvider, or: $value.paymentProvider),
    successorName: data.get(#successorName, or: $value.successorName),
    termsAccepted: data.get(#termsAccepted, or: $value.termsAccepted),
  );

  @override
  RecipientSelfUpdateCopyWith<$R2, RecipientSelfUpdate, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _RecipientSelfUpdateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

