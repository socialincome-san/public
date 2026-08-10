// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payment_information.dart';

class PaymentInformationMapper extends ClassMapperBase<PaymentInformation> {
  PaymentInformationMapper._();

  static PaymentInformationMapper? _instance;
  static PaymentInformationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentInformationMapper._());
      PhoneMapper.ensureInitialized();
      MobileMoneyProviderMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PaymentInformation';

  static String _$id(PaymentInformation v) => v.id;
  static const Field<PaymentInformation, String> _f$id = Field('id', _$id);
  static String _$phoneId(PaymentInformation v) => v.phoneId;
  static const Field<PaymentInformation, String> _f$phoneId = Field(
    'phoneId',
    _$phoneId,
  );
  static Phone _$phone(PaymentInformation v) => v.phone;
  static const Field<PaymentInformation, Phone> _f$phone = Field(
    'phone',
    _$phone,
  );
  static DateTime _$createdAt(PaymentInformation v) => v.createdAt;
  static const Field<PaymentInformation, DateTime> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
    hook: DateTimeHook(),
  );
  static String? _$mobileMoneyProviderId(PaymentInformation v) =>
      v.mobileMoneyProviderId;
  static const Field<PaymentInformation, String> _f$mobileMoneyProviderId =
      Field('mobileMoneyProviderId', _$mobileMoneyProviderId, opt: true);
  static MobileMoneyProvider? _$mobileMoneyProvider(PaymentInformation v) =>
      v.mobileMoneyProvider;
  static const Field<PaymentInformation, MobileMoneyProvider>
  _f$mobileMoneyProvider = Field(
    'mobileMoneyProvider',
    _$mobileMoneyProvider,
    opt: true,
  );
  static DateTime? _$updatedAt(PaymentInformation v) => v.updatedAt;
  static const Field<PaymentInformation, DateTime> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
    hook: DateTimeHook(),
  );

  @override
  final MappableFields<PaymentInformation> fields = const {
    #id: _f$id,
    #phoneId: _f$phoneId,
    #phone: _f$phone,
    #createdAt: _f$createdAt,
    #mobileMoneyProviderId: _f$mobileMoneyProviderId,
    #mobileMoneyProvider: _f$mobileMoneyProvider,
    #updatedAt: _f$updatedAt,
  };

  static PaymentInformation _instantiate(DecodingData data) {
    return PaymentInformation(
      id: data.dec(_f$id),
      phoneId: data.dec(_f$phoneId),
      phone: data.dec(_f$phone),
      createdAt: data.dec(_f$createdAt),
      mobileMoneyProviderId: data.dec(_f$mobileMoneyProviderId),
      mobileMoneyProvider: data.dec(_f$mobileMoneyProvider),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PaymentInformation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PaymentInformation>(map);
  }

  static PaymentInformation fromJson(String json) {
    return ensureInitialized().decodeJson<PaymentInformation>(json);
  }
}

mixin PaymentInformationMappable {
  String toJson() {
    return PaymentInformationMapper.ensureInitialized()
        .encodeJson<PaymentInformation>(this as PaymentInformation);
  }

  Map<String, dynamic> toMap() {
    return PaymentInformationMapper.ensureInitialized()
        .encodeMap<PaymentInformation>(this as PaymentInformation);
  }

  PaymentInformationCopyWith<
    PaymentInformation,
    PaymentInformation,
    PaymentInformation
  >
  get copyWith =>
      _PaymentInformationCopyWithImpl<PaymentInformation, PaymentInformation>(
        this as PaymentInformation,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return PaymentInformationMapper.ensureInitialized().stringifyValue(
      this as PaymentInformation,
    );
  }

  @override
  bool operator ==(Object other) {
    return PaymentInformationMapper.ensureInitialized().equalsValue(
      this as PaymentInformation,
      other,
    );
  }

  @override
  int get hashCode {
    return PaymentInformationMapper.ensureInitialized().hashValue(
      this as PaymentInformation,
    );
  }
}

extension PaymentInformationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PaymentInformation, $Out> {
  PaymentInformationCopyWith<$R, PaymentInformation, $Out>
  get $asPaymentInformation => $base.as(
    (v, t, t2) => _PaymentInformationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class PaymentInformationCopyWith<
  $R,
  $In extends PaymentInformation,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  PhoneCopyWith<$R, Phone, Phone> get phone;
  MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, MobileMoneyProvider>?
  get mobileMoneyProvider;
  $R call({
    String? id,
    String? phoneId,
    Phone? phone,
    DateTime? createdAt,
    String? mobileMoneyProviderId,
    MobileMoneyProvider? mobileMoneyProvider,
    DateTime? updatedAt,
  });
  PaymentInformationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _PaymentInformationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PaymentInformation, $Out>
    implements PaymentInformationCopyWith<$R, PaymentInformation, $Out> {
  _PaymentInformationCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PaymentInformation> $mapper =
      PaymentInformationMapper.ensureInitialized();
  @override
  PhoneCopyWith<$R, Phone, Phone> get phone =>
      $value.phone.copyWith.$chain((v) => call(phone: v));
  @override
  MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, MobileMoneyProvider>?
  get mobileMoneyProvider => $value.mobileMoneyProvider?.copyWith.$chain(
    (v) => call(mobileMoneyProvider: v),
  );
  @override
  $R call({
    String? id,
    String? phoneId,
    Phone? phone,
    DateTime? createdAt,
    Object? mobileMoneyProviderId = $none,
    Object? mobileMoneyProvider = $none,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (phoneId != null) #phoneId: phoneId,
      if (phone != null) #phone: phone,
      if (createdAt != null) #createdAt: createdAt,
      if (mobileMoneyProviderId != $none)
        #mobileMoneyProviderId: mobileMoneyProviderId,
      if (mobileMoneyProvider != $none)
        #mobileMoneyProvider: mobileMoneyProvider,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  PaymentInformation $make(CopyWithData data) => PaymentInformation(
    id: data.get(#id, or: $value.id),
    phoneId: data.get(#phoneId, or: $value.phoneId),
    phone: data.get(#phone, or: $value.phone),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    mobileMoneyProviderId: data.get(
      #mobileMoneyProviderId,
      or: $value.mobileMoneyProviderId,
    ),
    mobileMoneyProvider: data.get(
      #mobileMoneyProvider,
      or: $value.mobileMoneyProvider,
    ),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  PaymentInformationCopyWith<$R2, PaymentInformation, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PaymentInformationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

