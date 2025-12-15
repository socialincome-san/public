// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payout.dart';

class PayoutMapper extends ClassMapperBase<Payout> {
  PayoutMapper._();

  static PayoutMapper? _instance;
  static PayoutMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutMapper._());
      CurrencyMapper.ensureInitialized();
      PayoutStatusMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Payout';

  static String _$id(Payout v) => v.id;
  static const Field<Payout, String> _f$id = Field('id', _$id);
  static int _$amount(Payout v) => v.amount;
  static const Field<Payout, int> _f$amount = Field('amount', _$amount);
  static double? _$amountChf(Payout v) => v.amountChf;
  static const Field<Payout, double> _f$amountChf = Field(
    'amountChf',
    _$amountChf,
    opt: true,
  );
  static Currency _$currency(Payout v) => v.currency;
  static const Field<Payout, Currency> _f$currency = Field(
    'currency',
    _$currency,
  );
  static String _$paymentAt(Payout v) => v.paymentAt;
  static const Field<Payout, String> _f$paymentAt = Field(
    'paymentAt',
    _$paymentAt,
  );
  static PayoutStatus _$status(Payout v) => v.status;
  static const Field<Payout, PayoutStatus> _f$status = Field(
    'status',
    _$status,
  );
  static String? _$phoneNumber(Payout v) => v.phoneNumber;
  static const Field<Payout, String> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
    opt: true,
  );
  static String? _$comments(Payout v) => v.comments;
  static const Field<Payout, String> _f$comments = Field(
    'comments',
    _$comments,
    opt: true,
  );
  static String _$recipientId(Payout v) => v.recipientId;
  static const Field<Payout, String> _f$recipientId = Field(
    'recipientId',
    _$recipientId,
  );
  static String _$createdAt(Payout v) => v.createdAt;
  static const Field<Payout, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(Payout v) => v.updatedAt;
  static const Field<Payout, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<Payout> fields = const {
    #id: _f$id,
    #amount: _f$amount,
    #amountChf: _f$amountChf,
    #currency: _f$currency,
    #paymentAt: _f$paymentAt,
    #status: _f$status,
    #phoneNumber: _f$phoneNumber,
    #comments: _f$comments,
    #recipientId: _f$recipientId,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Payout _instantiate(DecodingData data) {
    return Payout(
      id: data.dec(_f$id),
      amount: data.dec(_f$amount),
      amountChf: data.dec(_f$amountChf),
      currency: data.dec(_f$currency),
      paymentAt: data.dec(_f$paymentAt),
      status: data.dec(_f$status),
      phoneNumber: data.dec(_f$phoneNumber),
      comments: data.dec(_f$comments),
      recipientId: data.dec(_f$recipientId),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Payout fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Payout>(map);
  }

  static Payout fromJson(String json) {
    return ensureInitialized().decodeJson<Payout>(json);
  }
}

mixin PayoutMappable {
  String toJson() {
    return PayoutMapper.ensureInitialized().encodeJson<Payout>(this as Payout);
  }

  Map<String, dynamic> toMap() {
    return PayoutMapper.ensureInitialized().encodeMap<Payout>(this as Payout);
  }

  PayoutCopyWith<Payout, Payout, Payout> get copyWith =>
      _PayoutCopyWithImpl<Payout, Payout>(this as Payout, $identity, $identity);
  @override
  String toString() {
    return PayoutMapper.ensureInitialized().stringifyValue(this as Payout);
  }

  @override
  bool operator ==(Object other) {
    return PayoutMapper.ensureInitialized().equalsValue(this as Payout, other);
  }

  @override
  int get hashCode {
    return PayoutMapper.ensureInitialized().hashValue(this as Payout);
  }
}

extension PayoutValueCopy<$R, $Out> on ObjectCopyWith<$R, Payout, $Out> {
  PayoutCopyWith<$R, Payout, $Out> get $asPayout =>
      $base.as((v, t, t2) => _PayoutCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PayoutCopyWith<$R, $In extends Payout, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    int? amount,
    double? amountChf,
    Currency? currency,
    String? paymentAt,
    PayoutStatus? status,
    String? phoneNumber,
    String? comments,
    String? recipientId,
    String? createdAt,
    String? updatedAt,
  });
  PayoutCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PayoutCopyWithImpl<$R, $Out> extends ClassCopyWithBase<$R, Payout, $Out>
    implements PayoutCopyWith<$R, Payout, $Out> {
  _PayoutCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Payout> $mapper = PayoutMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    int? amount,
    Object? amountChf = $none,
    Currency? currency,
    String? paymentAt,
    PayoutStatus? status,
    Object? phoneNumber = $none,
    Object? comments = $none,
    String? recipientId,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (amount != null) #amount: amount,
      if (amountChf != $none) #amountChf: amountChf,
      if (currency != null) #currency: currency,
      if (paymentAt != null) #paymentAt: paymentAt,
      if (status != null) #status: status,
      if (phoneNumber != $none) #phoneNumber: phoneNumber,
      if (comments != $none) #comments: comments,
      if (recipientId != null) #recipientId: recipientId,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Payout $make(CopyWithData data) => Payout(
    id: data.get(#id, or: $value.id),
    amount: data.get(#amount, or: $value.amount),
    amountChf: data.get(#amountChf, or: $value.amountChf),
    currency: data.get(#currency, or: $value.currency),
    paymentAt: data.get(#paymentAt, or: $value.paymentAt),
    status: data.get(#status, or: $value.status),
    phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
    comments: data.get(#comments, or: $value.comments),
    recipientId: data.get(#recipientId, or: $value.recipientId),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  PayoutCopyWith<$R2, Payout, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _PayoutCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

