// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'mapped_payment.dart';

class MappedPaymentMapper extends ClassMapperBase<MappedPayment> {
  MappedPaymentMapper._();

  static MappedPaymentMapper? _instance;
  static MappedPaymentMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = MappedPaymentMapper._());
      PayoutMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'MappedPayment';

  static Payout _$payment(MappedPayment v) => v.payment;
  static const Field<MappedPayment, Payout> _f$payment = Field(
    'payment',
    _$payment,
  );
  static PaymentUiStatus _$uiStatus(MappedPayment v) => v.uiStatus;
  static const Field<MappedPayment, PaymentUiStatus> _f$uiStatus = Field(
    'uiStatus',
    _$uiStatus,
  );

  @override
  final MappableFields<MappedPayment> fields = const {
    #payment: _f$payment,
    #uiStatus: _f$uiStatus,
  };

  static MappedPayment _instantiate(DecodingData data) {
    return MappedPayment(
      payment: data.dec(_f$payment),
      uiStatus: data.dec(_f$uiStatus),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static MappedPayment fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<MappedPayment>(map);
  }

  static MappedPayment fromJson(String json) {
    return ensureInitialized().decodeJson<MappedPayment>(json);
  }
}

mixin MappedPaymentMappable {
  String toJson() {
    return MappedPaymentMapper.ensureInitialized().encodeJson<MappedPayment>(
      this as MappedPayment,
    );
  }

  Map<String, dynamic> toMap() {
    return MappedPaymentMapper.ensureInitialized().encodeMap<MappedPayment>(
      this as MappedPayment,
    );
  }

  MappedPaymentCopyWith<MappedPayment, MappedPayment, MappedPayment>
  get copyWith => _MappedPaymentCopyWithImpl<MappedPayment, MappedPayment>(
    this as MappedPayment,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return MappedPaymentMapper.ensureInitialized().stringifyValue(
      this as MappedPayment,
    );
  }

  @override
  bool operator ==(Object other) {
    return MappedPaymentMapper.ensureInitialized().equalsValue(
      this as MappedPayment,
      other,
    );
  }

  @override
  int get hashCode {
    return MappedPaymentMapper.ensureInitialized().hashValue(
      this as MappedPayment,
    );
  }
}

extension MappedPaymentValueCopy<$R, $Out>
    on ObjectCopyWith<$R, MappedPayment, $Out> {
  MappedPaymentCopyWith<$R, MappedPayment, $Out> get $asMappedPayment =>
      $base.as((v, t, t2) => _MappedPaymentCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class MappedPaymentCopyWith<$R, $In extends MappedPayment, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PayoutCopyWith<$R, Payout, Payout> get payment;
  $R call({Payout? payment, PaymentUiStatus? uiStatus});
  MappedPaymentCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _MappedPaymentCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, MappedPayment, $Out>
    implements MappedPaymentCopyWith<$R, MappedPayment, $Out> {
  _MappedPaymentCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<MappedPayment> $mapper =
      MappedPaymentMapper.ensureInitialized();
  @override
  PayoutCopyWith<$R, Payout, Payout> get payment =>
      $value.payment.copyWith.$chain((v) => call(payment: v));
  @override
  $R call({Payout? payment, PaymentUiStatus? uiStatus}) => $apply(
    FieldCopyWithData({
      if (payment != null) #payment: payment,
      if (uiStatus != null) #uiStatus: uiStatus,
    }),
  );
  @override
  MappedPayment $make(CopyWithData data) => MappedPayment(
    payment: data.get(#payment, or: $value.payment),
    uiStatus: data.get(#uiStatus, or: $value.uiStatus),
  );

  @override
  MappedPaymentCopyWith<$R2, MappedPayment, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _MappedPaymentCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

