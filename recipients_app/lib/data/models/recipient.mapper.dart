// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'recipient.dart';

class RecipientMapper extends ClassMapperBase<Recipient> {
  RecipientMapper._();

  static RecipientMapper? _instance;
  static RecipientMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RecipientMapper._());
      PhoneMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Recipient';

  static String _$userId(Recipient v) => v.userId;
  static const Field<Recipient, String> _f$userId = Field('userId', _$userId);
  static Phone? _$communicationMobilePhone(Recipient v) =>
      v.communicationMobilePhone;
  static const Field<Recipient, Phone> _f$communicationMobilePhone = Field(
    'communicationMobilePhone',
    _$communicationMobilePhone,
  );
  static Phone? _$mobileMoneyPhone(Recipient v) => v.mobileMoneyPhone;
  static const Field<Recipient, Phone> _f$mobileMoneyPhone = Field(
    'mobileMoneyPhone',
    _$mobileMoneyPhone,
    opt: true,
  );
  static String? _$firstName(Recipient v) => v.firstName;
  static const Field<Recipient, String> _f$firstName = Field(
    'firstName',
    _$firstName,
    opt: true,
  );
  static String? _$lastName(Recipient v) => v.lastName;
  static const Field<Recipient, String> _f$lastName = Field(
    'lastName',
    _$lastName,
    opt: true,
  );
  static Timestamp? _$birthDate(Recipient v) => v.birthDate;
  static const Field<Recipient, Timestamp> _f$birthDate = Field(
    'birthDate',
    _$birthDate,
    opt: true,
  );
  static String? _$email(Recipient v) => v.email;
  static const Field<Recipient, String> _f$email = Field(
    'email',
    _$email,
    opt: true,
  );
  static String? _$country(Recipient v) => v.country;
  static const Field<Recipient, String> _f$country = Field(
    'country',
    _$country,
    opt: true,
  );
  static String? _$preferredName(Recipient v) => v.preferredName;
  static const Field<Recipient, String> _f$preferredName = Field(
    'preferredName',
    _$preferredName,
    opt: true,
  );
  static String? _$callingName(Recipient v) => v.callingName;
  static const Field<Recipient, String> _f$callingName = Field(
    'callingName',
    _$callingName,
    opt: true,
  );
  static String? _$paymentProvider(Recipient v) => v.paymentProvider;
  static const Field<Recipient, String> _f$paymentProvider = Field(
    'paymentProvider',
    _$paymentProvider,
    opt: true,
  );
  static String? _$gender(Recipient v) => v.gender;
  static const Field<Recipient, String> _f$gender = Field(
    'gender',
    _$gender,
    opt: true,
  );
  static String? _$selectedLanguage(Recipient v) => v.selectedLanguage;
  static const Field<Recipient, String> _f$selectedLanguage = Field(
    'selectedLanguage',
    _$selectedLanguage,
    opt: true,
  );
  static bool? _$termsAccepted(Recipient v) => v.termsAccepted;
  static const Field<Recipient, bool> _f$termsAccepted = Field(
    'termsAccepted',
    _$termsAccepted,
    opt: true,
  );
  static DateTime? _$recipientSince(Recipient v) => v.recipientSince;
  static const Field<Recipient, DateTime> _f$recipientSince = Field(
    'recipientSince',
    _$recipientSince,
    opt: true,
  );
  static String? _$imLinkInitial(Recipient v) => v.imLinkInitial;
  static const Field<Recipient, String> _f$imLinkInitial = Field(
    'imLinkInitial',
    _$imLinkInitial,
    opt: true,
  );
  static String? _$imLinkRegular(Recipient v) => v.imLinkRegular;
  static const Field<Recipient, String> _f$imLinkRegular = Field(
    'imLinkRegular',
    _$imLinkRegular,
    opt: true,
  );
  static Timestamp? _$nextSurvey(Recipient v) => v.nextSurvey;
  static const Field<Recipient, Timestamp> _f$nextSurvey = Field(
    'nextSurvey',
    _$nextSurvey,
    opt: true,
  );
  static DocumentReference<Object?>? _$organizationRef(Recipient v) =>
      v.organizationRef;
  static const Field<Recipient, DocumentReference<Object?>> _f$organizationRef =
      Field('organizationRef', _$organizationRef, opt: true);
  static String? _$updatedBy(Recipient v) => v.updatedBy;
  static const Field<Recipient, String> _f$updatedBy = Field(
    'updatedBy',
    _$updatedBy,
    opt: true,
  );
  static String? _$successorName(Recipient v) => v.successorName;
  static const Field<Recipient, String> _f$successorName = Field(
    'successorName',
    _$successorName,
    opt: true,
  );

  @override
  final MappableFields<Recipient> fields = const {
    #userId: _f$userId,
    #communicationMobilePhone: _f$communicationMobilePhone,
    #mobileMoneyPhone: _f$mobileMoneyPhone,
    #firstName: _f$firstName,
    #lastName: _f$lastName,
    #birthDate: _f$birthDate,
    #email: _f$email,
    #country: _f$country,
    #preferredName: _f$preferredName,
    #callingName: _f$callingName,
    #paymentProvider: _f$paymentProvider,
    #gender: _f$gender,
    #selectedLanguage: _f$selectedLanguage,
    #termsAccepted: _f$termsAccepted,
    #recipientSince: _f$recipientSince,
    #imLinkInitial: _f$imLinkInitial,
    #imLinkRegular: _f$imLinkRegular,
    #nextSurvey: _f$nextSurvey,
    #organizationRef: _f$organizationRef,
    #updatedBy: _f$updatedBy,
    #successorName: _f$successorName,
  };

  static Recipient _instantiate(DecodingData data) {
    return Recipient(
      userId: data.dec(_f$userId),
      communicationMobilePhone: data.dec(_f$communicationMobilePhone),
      mobileMoneyPhone: data.dec(_f$mobileMoneyPhone),
      firstName: data.dec(_f$firstName),
      lastName: data.dec(_f$lastName),
      birthDate: data.dec(_f$birthDate),
      email: data.dec(_f$email),
      country: data.dec(_f$country),
      preferredName: data.dec(_f$preferredName),
      callingName: data.dec(_f$callingName),
      paymentProvider: data.dec(_f$paymentProvider),
      gender: data.dec(_f$gender),
      selectedLanguage: data.dec(_f$selectedLanguage),
      termsAccepted: data.dec(_f$termsAccepted),
      recipientSince: data.dec(_f$recipientSince),
      imLinkInitial: data.dec(_f$imLinkInitial),
      imLinkRegular: data.dec(_f$imLinkRegular),
      nextSurvey: data.dec(_f$nextSurvey),
      organizationRef: data.dec(_f$organizationRef),
      updatedBy: data.dec(_f$updatedBy),
      successorName: data.dec(_f$successorName),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Recipient fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Recipient>(map);
  }

  static Recipient fromJson(String json) {
    return ensureInitialized().decodeJson<Recipient>(json);
  }
}

mixin RecipientMappable {
  String toJson() {
    return RecipientMapper.ensureInitialized().encodeJson<Recipient>(
      this as Recipient,
    );
  }

  Map<String, dynamic> toMap() {
    return RecipientMapper.ensureInitialized().encodeMap<Recipient>(
      this as Recipient,
    );
  }

  RecipientCopyWith<Recipient, Recipient, Recipient> get copyWith =>
      _RecipientCopyWithImpl<Recipient, Recipient>(
        this as Recipient,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return RecipientMapper.ensureInitialized().stringifyValue(
      this as Recipient,
    );
  }

  @override
  bool operator ==(Object other) {
    return RecipientMapper.ensureInitialized().equalsValue(
      this as Recipient,
      other,
    );
  }

  @override
  int get hashCode {
    return RecipientMapper.ensureInitialized().hashValue(this as Recipient);
  }
}

extension RecipientValueCopy<$R, $Out> on ObjectCopyWith<$R, Recipient, $Out> {
  RecipientCopyWith<$R, Recipient, $Out> get $asRecipient =>
      $base.as((v, t, t2) => _RecipientCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class RecipientCopyWith<$R, $In extends Recipient, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PhoneCopyWith<$R, Phone, Phone>? get communicationMobilePhone;
  PhoneCopyWith<$R, Phone, Phone>? get mobileMoneyPhone;
  $R call({
    String? userId,
    Phone? communicationMobilePhone,
    Phone? mobileMoneyPhone,
    String? firstName,
    String? lastName,
    Timestamp? birthDate,
    String? email,
    String? country,
    String? preferredName,
    String? callingName,
    String? paymentProvider,
    String? gender,
    String? selectedLanguage,
    bool? termsAccepted,
    DateTime? recipientSince,
    String? imLinkInitial,
    String? imLinkRegular,
    Timestamp? nextSurvey,
    DocumentReference<Object?>? organizationRef,
    String? updatedBy,
    String? successorName,
  });
  RecipientCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _RecipientCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Recipient, $Out>
    implements RecipientCopyWith<$R, Recipient, $Out> {
  _RecipientCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Recipient> $mapper =
      RecipientMapper.ensureInitialized();
  @override
  PhoneCopyWith<$R, Phone, Phone>? get communicationMobilePhone => $value
      .communicationMobilePhone
      ?.copyWith
      .$chain((v) => call(communicationMobilePhone: v));
  @override
  PhoneCopyWith<$R, Phone, Phone>? get mobileMoneyPhone => $value
      .mobileMoneyPhone
      ?.copyWith
      .$chain((v) => call(mobileMoneyPhone: v));
  @override
  $R call({
    String? userId,
    Object? communicationMobilePhone = $none,
    Object? mobileMoneyPhone = $none,
    Object? firstName = $none,
    Object? lastName = $none,
    Object? birthDate = $none,
    Object? email = $none,
    Object? country = $none,
    Object? preferredName = $none,
    Object? callingName = $none,
    Object? paymentProvider = $none,
    Object? gender = $none,
    Object? selectedLanguage = $none,
    Object? termsAccepted = $none,
    Object? recipientSince = $none,
    Object? imLinkInitial = $none,
    Object? imLinkRegular = $none,
    Object? nextSurvey = $none,
    Object? organizationRef = $none,
    Object? updatedBy = $none,
    Object? successorName = $none,
  }) => $apply(
    FieldCopyWithData({
      if (userId != null) #userId: userId,
      if (communicationMobilePhone != $none)
        #communicationMobilePhone: communicationMobilePhone,
      if (mobileMoneyPhone != $none) #mobileMoneyPhone: mobileMoneyPhone,
      if (firstName != $none) #firstName: firstName,
      if (lastName != $none) #lastName: lastName,
      if (birthDate != $none) #birthDate: birthDate,
      if (email != $none) #email: email,
      if (country != $none) #country: country,
      if (preferredName != $none) #preferredName: preferredName,
      if (callingName != $none) #callingName: callingName,
      if (paymentProvider != $none) #paymentProvider: paymentProvider,
      if (gender != $none) #gender: gender,
      if (selectedLanguage != $none) #selectedLanguage: selectedLanguage,
      if (termsAccepted != $none) #termsAccepted: termsAccepted,
      if (recipientSince != $none) #recipientSince: recipientSince,
      if (imLinkInitial != $none) #imLinkInitial: imLinkInitial,
      if (imLinkRegular != $none) #imLinkRegular: imLinkRegular,
      if (nextSurvey != $none) #nextSurvey: nextSurvey,
      if (organizationRef != $none) #organizationRef: organizationRef,
      if (updatedBy != $none) #updatedBy: updatedBy,
      if (successorName != $none) #successorName: successorName,
    }),
  );
  @override
  Recipient $make(CopyWithData data) => Recipient(
    userId: data.get(#userId, or: $value.userId),
    communicationMobilePhone: data.get(
      #communicationMobilePhone,
      or: $value.communicationMobilePhone,
    ),
    mobileMoneyPhone: data.get(#mobileMoneyPhone, or: $value.mobileMoneyPhone),
    firstName: data.get(#firstName, or: $value.firstName),
    lastName: data.get(#lastName, or: $value.lastName),
    birthDate: data.get(#birthDate, or: $value.birthDate),
    email: data.get(#email, or: $value.email),
    country: data.get(#country, or: $value.country),
    preferredName: data.get(#preferredName, or: $value.preferredName),
    callingName: data.get(#callingName, or: $value.callingName),
    paymentProvider: data.get(#paymentProvider, or: $value.paymentProvider),
    gender: data.get(#gender, or: $value.gender),
    selectedLanguage: data.get(#selectedLanguage, or: $value.selectedLanguage),
    termsAccepted: data.get(#termsAccepted, or: $value.termsAccepted),
    recipientSince: data.get(#recipientSince, or: $value.recipientSince),
    imLinkInitial: data.get(#imLinkInitial, or: $value.imLinkInitial),
    imLinkRegular: data.get(#imLinkRegular, or: $value.imLinkRegular),
    nextSurvey: data.get(#nextSurvey, or: $value.nextSurvey),
    organizationRef: data.get(#organizationRef, or: $value.organizationRef),
    updatedBy: data.get(#updatedBy, or: $value.updatedBy),
    successorName: data.get(#successorName, or: $value.successorName),
  );

  @override
  RecipientCopyWith<$R2, Recipient, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _RecipientCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

