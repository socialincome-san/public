// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'social_income_payment.dart';

class PaymentStatusMapper extends EnumMapper<PaymentStatus> {
  PaymentStatusMapper._();

  static PaymentStatusMapper? _instance;
  static PaymentStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentStatusMapper._());
    }
    return _instance!;
  }

  static PaymentStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PaymentStatus decode(dynamic value) {
    switch (value) {
      case r'created':
        return PaymentStatus.created;
      case r'paid':
        return PaymentStatus.paid;
      case r'confirmed':
        return PaymentStatus.confirmed;
      case r'contested':
        return PaymentStatus.contested;
      case r'failed':
        return PaymentStatus.failed;
      case r'other':
        return PaymentStatus.other;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PaymentStatus self) {
    switch (self) {
      case PaymentStatus.created:
        return r'created';
      case PaymentStatus.paid:
        return r'paid';
      case PaymentStatus.confirmed:
        return r'confirmed';
      case PaymentStatus.contested:
        return r'contested';
      case PaymentStatus.failed:
        return r'failed';
      case PaymentStatus.other:
        return r'other';
    }
  }
}

extension PaymentStatusMapperExtension on PaymentStatus {
  String toValue() {
    PaymentStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PaymentStatus>(this) as String;
  }
}

class SocialIncomePaymentMapper extends ClassMapperBase<SocialIncomePayment> {
  SocialIncomePaymentMapper._();

  static SocialIncomePaymentMapper? _instance;
  static SocialIncomePaymentMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SocialIncomePaymentMapper._());
      PaymentStatusMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'SocialIncomePayment';

  static String _$id(SocialIncomePayment v) => v.id;
  static const Field<SocialIncomePayment, String> _f$id = Field('id', _$id);
  static int? _$amount(SocialIncomePayment v) => v.amount;
  static const Field<SocialIncomePayment, int> _f$amount = Field(
    'amount',
    _$amount,
    opt: true,
  );
  static Timestamp? _$paymentAt(SocialIncomePayment v) => v.paymentAt;
  static const Field<SocialIncomePayment, Timestamp> _f$paymentAt = Field(
    'paymentAt',
    _$paymentAt,
    opt: true,
  );
  static String? _$currency(SocialIncomePayment v) => v.currency;
  static const Field<SocialIncomePayment, String> _f$currency = Field(
    'currency',
    _$currency,
    opt: true,
  );
  static PaymentStatus? _$status(SocialIncomePayment v) => v.status;
  static const Field<SocialIncomePayment, PaymentStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
  );
  static String? _$comments(SocialIncomePayment v) => v.comments;
  static const Field<SocialIncomePayment, String> _f$comments = Field(
    'comments',
    _$comments,
    opt: true,
  );
  static String? _$updatedBy(SocialIncomePayment v) => v.updatedBy;
  static const Field<SocialIncomePayment, String> _f$updatedBy = Field(
    'updatedBy',
    _$updatedBy,
    opt: true,
  );

  @override
  final MappableFields<SocialIncomePayment> fields = const {
    #id: _f$id,
    #amount: _f$amount,
    #paymentAt: _f$paymentAt,
    #currency: _f$currency,
    #status: _f$status,
    #comments: _f$comments,
    #updatedBy: _f$updatedBy,
  };

  static SocialIncomePayment _instantiate(DecodingData data) {
    return SocialIncomePayment(
      id: data.dec(_f$id),
      amount: data.dec(_f$amount),
      paymentAt: data.dec(_f$paymentAt),
      currency: data.dec(_f$currency),
      status: data.dec(_f$status),
      comments: data.dec(_f$comments),
      updatedBy: data.dec(_f$updatedBy),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static SocialIncomePayment fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<SocialIncomePayment>(map);
  }

  static SocialIncomePayment fromJson(String json) {
    return ensureInitialized().decodeJson<SocialIncomePayment>(json);
  }
}

mixin SocialIncomePaymentMappable {
  String toJson() {
    return SocialIncomePaymentMapper.ensureInitialized()
        .encodeJson<SocialIncomePayment>(this as SocialIncomePayment);
  }

  Map<String, dynamic> toMap() {
    return SocialIncomePaymentMapper.ensureInitialized()
        .encodeMap<SocialIncomePayment>(this as SocialIncomePayment);
  }

  SocialIncomePaymentCopyWith<
    SocialIncomePayment,
    SocialIncomePayment,
    SocialIncomePayment
  >
  get copyWith =>
      _SocialIncomePaymentCopyWithImpl<
        SocialIncomePayment,
        SocialIncomePayment
      >(this as SocialIncomePayment, $identity, $identity);
  @override
  String toString() {
    return SocialIncomePaymentMapper.ensureInitialized().stringifyValue(
      this as SocialIncomePayment,
    );
  }

  @override
  bool operator ==(Object other) {
    return SocialIncomePaymentMapper.ensureInitialized().equalsValue(
      this as SocialIncomePayment,
      other,
    );
  }

  @override
  int get hashCode {
    return SocialIncomePaymentMapper.ensureInitialized().hashValue(
      this as SocialIncomePayment,
    );
  }
}

extension SocialIncomePaymentValueCopy<$R, $Out>
    on ObjectCopyWith<$R, SocialIncomePayment, $Out> {
  SocialIncomePaymentCopyWith<$R, SocialIncomePayment, $Out>
  get $asSocialIncomePayment => $base.as(
    (v, t, t2) => _SocialIncomePaymentCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class SocialIncomePaymentCopyWith<
  $R,
  $In extends SocialIncomePayment,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    int? amount,
    Timestamp? paymentAt,
    String? currency,
    PaymentStatus? status,
    String? comments,
    String? updatedBy,
  });
  SocialIncomePaymentCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _SocialIncomePaymentCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, SocialIncomePayment, $Out>
    implements SocialIncomePaymentCopyWith<$R, SocialIncomePayment, $Out> {
  _SocialIncomePaymentCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<SocialIncomePayment> $mapper =
      SocialIncomePaymentMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    Object? amount = $none,
    Object? paymentAt = $none,
    Object? currency = $none,
    Object? status = $none,
    Object? comments = $none,
    Object? updatedBy = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (amount != $none) #amount: amount,
      if (paymentAt != $none) #paymentAt: paymentAt,
      if (currency != $none) #currency: currency,
      if (status != $none) #status: status,
      if (comments != $none) #comments: comments,
      if (updatedBy != $none) #updatedBy: updatedBy,
    }),
  );
  @override
  SocialIncomePayment $make(CopyWithData data) => SocialIncomePayment(
    id: data.get(#id, or: $value.id),
    amount: data.get(#amount, or: $value.amount),
    paymentAt: data.get(#paymentAt, or: $value.paymentAt),
    currency: data.get(#currency, or: $value.currency),
    status: data.get(#status, or: $value.status),
    comments: data.get(#comments, or: $value.comments),
    updatedBy: data.get(#updatedBy, or: $value.updatedBy),
  );

  @override
  SocialIncomePaymentCopyWith<$R2, SocialIncomePayment, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _SocialIncomePaymentCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

