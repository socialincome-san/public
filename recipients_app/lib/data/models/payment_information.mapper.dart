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
      MobileMoneyProviderMapper.ensureInitialized();
      PhoneMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PaymentInformation';

  static String _$id(PaymentInformation v) => v.id;
  static const Field<PaymentInformation, String> _f$id = Field('id', _$id);
  static String _$mobileMoneyProviderId(PaymentInformation v) =>
      v.mobileMoneyProviderId;
  static const Field<PaymentInformation, String> _f$mobileMoneyProviderId =
      Field('mobileMoneyProviderId', _$mobileMoneyProviderId);
  static MobileMoneyProvider _$mobileMoneyProvider(PaymentInformation v) =>
      v.mobileMoneyProvider;
  static const Field<PaymentInformation, MobileMoneyProvider>
  _f$mobileMoneyProvider = Field('mobileMoneyProvider', _$mobileMoneyProvider);
  static String _$code(PaymentInformation v) => v.code;
  static const Field<PaymentInformation, String> _f$code = Field(
    'code',
    _$code,
  );
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
  static String _$createdAt(PaymentInformation v) => v.createdAt;
  static const Field<PaymentInformation, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(PaymentInformation v) => v.updatedAt;
  static const Field<PaymentInformation, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<PaymentInformation> fields = const {
    #id: _f$id,
    #mobileMoneyProviderId: _f$mobileMoneyProviderId,
    #mobileMoneyProvider: _f$mobileMoneyProvider,
    #code: _f$code,
    #phoneId: _f$phoneId,
    #phone: _f$phone,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static PaymentInformation _instantiate(DecodingData data) {
    return PaymentInformation(
      id: data.dec(_f$id),
      mobileMoneyProviderId: data.dec(_f$mobileMoneyProviderId),
      mobileMoneyProvider: data.dec(_f$mobileMoneyProvider),
      code: data.dec(_f$code),
      phoneId: data.dec(_f$phoneId),
      phone: data.dec(_f$phone),
      createdAt: data.dec(_f$createdAt),
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
  MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, MobileMoneyProvider>
  get mobileMoneyProvider;
  PhoneCopyWith<$R, Phone, Phone> get phone;
  $R call({
    String? id,
    String? mobileMoneyProviderId,
    MobileMoneyProvider? mobileMoneyProvider,
    String? code,
    String? phoneId,
    Phone? phone,
    String? createdAt,
    String? updatedAt,
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
  MobileMoneyProviderCopyWith<$R, MobileMoneyProvider, MobileMoneyProvider>
  get mobileMoneyProvider => $value.mobileMoneyProvider.copyWith.$chain(
    (v) => call(mobileMoneyProvider: v),
  );
  @override
  PhoneCopyWith<$R, Phone, Phone> get phone =>
      $value.phone.copyWith.$chain((v) => call(phone: v));
  @override
  $R call({
    String? id,
    String? mobileMoneyProviderId,
    MobileMoneyProvider? mobileMoneyProvider,
    String? code,
    String? phoneId,
    Phone? phone,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (mobileMoneyProviderId != null)
        #mobileMoneyProviderId: mobileMoneyProviderId,
      if (mobileMoneyProvider != null)
        #mobileMoneyProvider: mobileMoneyProvider,
      if (code != null) #code: code,
      if (phoneId != null) #phoneId: phoneId,
      if (phone != null) #phone: phone,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  PaymentInformation $make(CopyWithData data) => PaymentInformation(
    id: data.get(#id, or: $value.id),
    mobileMoneyProviderId: data.get(
      #mobileMoneyProviderId,
      or: $value.mobileMoneyProviderId,
    ),
    mobileMoneyProvider: data.get(
      #mobileMoneyProvider,
      or: $value.mobileMoneyProvider,
    ),
    code: data.get(#code, or: $value.code),
    phoneId: data.get(#phoneId, or: $value.phoneId),
    phone: data.get(#phone, or: $value.phone),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  PaymentInformationCopyWith<$R2, PaymentInformation, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PaymentInformationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

