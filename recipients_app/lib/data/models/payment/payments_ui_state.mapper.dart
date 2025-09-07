// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payments_ui_state.dart';

class PaymentsUiStateMapper extends ClassMapperBase<PaymentsUiState> {
  PaymentsUiStateMapper._();

  static PaymentsUiStateMapper? _instance;
  static PaymentsUiStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentsUiStateMapper._());
      MappedPaymentMapper.ensureInitialized();
      NextPaymentDataMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PaymentsUiState';

  static BalanceCardStatus _$status(PaymentsUiState v) => v.status;
  static const Field<PaymentsUiState, BalanceCardStatus> _f$status = Field(
    'status',
    _$status,
  );
  static List<MappedPayment> _$payments(PaymentsUiState v) => v.payments;
  static const Field<PaymentsUiState, List<MappedPayment>> _f$payments = Field(
    'payments',
    _$payments,
    opt: true,
    def: const [],
  );
  static int _$confirmedPaymentsCount(PaymentsUiState v) =>
      v.confirmedPaymentsCount;
  static const Field<PaymentsUiState, int> _f$confirmedPaymentsCount = Field(
    'confirmedPaymentsCount',
    _$confirmedPaymentsCount,
  );
  static int _$unconfirmedPaymentsCount(PaymentsUiState v) =>
      v.unconfirmedPaymentsCount;
  static const Field<PaymentsUiState, int> _f$unconfirmedPaymentsCount = Field(
    'unconfirmedPaymentsCount',
    _$unconfirmedPaymentsCount,
  );
  static NextPaymentData _$nextPayment(PaymentsUiState v) => v.nextPayment;
  static const Field<PaymentsUiState, NextPaymentData> _f$nextPayment = Field(
    'nextPayment',
    _$nextPayment,
  );
  static MappedPayment? _$lastPaidPayment(PaymentsUiState v) =>
      v.lastPaidPayment;
  static const Field<PaymentsUiState, MappedPayment> _f$lastPaidPayment = Field(
    'lastPaidPayment',
    _$lastPaidPayment,
    opt: true,
  );

  @override
  final MappableFields<PaymentsUiState> fields = const {
    #status: _f$status,
    #payments: _f$payments,
    #confirmedPaymentsCount: _f$confirmedPaymentsCount,
    #unconfirmedPaymentsCount: _f$unconfirmedPaymentsCount,
    #nextPayment: _f$nextPayment,
    #lastPaidPayment: _f$lastPaidPayment,
  };

  static PaymentsUiState _instantiate(DecodingData data) {
    return PaymentsUiState(
      status: data.dec(_f$status),
      payments: data.dec(_f$payments),
      confirmedPaymentsCount: data.dec(_f$confirmedPaymentsCount),
      unconfirmedPaymentsCount: data.dec(_f$unconfirmedPaymentsCount),
      nextPayment: data.dec(_f$nextPayment),
      lastPaidPayment: data.dec(_f$lastPaidPayment),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PaymentsUiState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PaymentsUiState>(map);
  }

  static PaymentsUiState fromJson(String json) {
    return ensureInitialized().decodeJson<PaymentsUiState>(json);
  }
}

mixin PaymentsUiStateMappable {
  String toJson() {
    return PaymentsUiStateMapper.ensureInitialized()
        .encodeJson<PaymentsUiState>(this as PaymentsUiState);
  }

  Map<String, dynamic> toMap() {
    return PaymentsUiStateMapper.ensureInitialized().encodeMap<PaymentsUiState>(
      this as PaymentsUiState,
    );
  }

  PaymentsUiStateCopyWith<PaymentsUiState, PaymentsUiState, PaymentsUiState>
  get copyWith =>
      _PaymentsUiStateCopyWithImpl<PaymentsUiState, PaymentsUiState>(
        this as PaymentsUiState,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return PaymentsUiStateMapper.ensureInitialized().stringifyValue(
      this as PaymentsUiState,
    );
  }

  @override
  bool operator ==(Object other) {
    return PaymentsUiStateMapper.ensureInitialized().equalsValue(
      this as PaymentsUiState,
      other,
    );
  }

  @override
  int get hashCode {
    return PaymentsUiStateMapper.ensureInitialized().hashValue(
      this as PaymentsUiState,
    );
  }
}

extension PaymentsUiStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PaymentsUiState, $Out> {
  PaymentsUiStateCopyWith<$R, PaymentsUiState, $Out> get $asPaymentsUiState =>
      $base.as((v, t, t2) => _PaymentsUiStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PaymentsUiStateCopyWith<$R, $In extends PaymentsUiState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  ListCopyWith<
    $R,
    MappedPayment,
    MappedPaymentCopyWith<$R, MappedPayment, MappedPayment>
  >
  get payments;
  NextPaymentDataCopyWith<$R, NextPaymentData, NextPaymentData> get nextPayment;
  MappedPaymentCopyWith<$R, MappedPayment, MappedPayment>? get lastPaidPayment;
  $R call({
    BalanceCardStatus? status,
    List<MappedPayment>? payments,
    int? confirmedPaymentsCount,
    int? unconfirmedPaymentsCount,
    NextPaymentData? nextPayment,
    MappedPayment? lastPaidPayment,
  });
  PaymentsUiStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _PaymentsUiStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PaymentsUiState, $Out>
    implements PaymentsUiStateCopyWith<$R, PaymentsUiState, $Out> {
  _PaymentsUiStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PaymentsUiState> $mapper =
      PaymentsUiStateMapper.ensureInitialized();
  @override
  ListCopyWith<
    $R,
    MappedPayment,
    MappedPaymentCopyWith<$R, MappedPayment, MappedPayment>
  >
  get payments => ListCopyWith(
    $value.payments,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(payments: v),
  );
  @override
  NextPaymentDataCopyWith<$R, NextPaymentData, NextPaymentData>
  get nextPayment =>
      $value.nextPayment.copyWith.$chain((v) => call(nextPayment: v));
  @override
  MappedPaymentCopyWith<$R, MappedPayment, MappedPayment>?
  get lastPaidPayment =>
      $value.lastPaidPayment?.copyWith.$chain((v) => call(lastPaidPayment: v));
  @override
  $R call({
    BalanceCardStatus? status,
    List<MappedPayment>? payments,
    int? confirmedPaymentsCount,
    int? unconfirmedPaymentsCount,
    NextPaymentData? nextPayment,
    Object? lastPaidPayment = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (payments != null) #payments: payments,
      if (confirmedPaymentsCount != null)
        #confirmedPaymentsCount: confirmedPaymentsCount,
      if (unconfirmedPaymentsCount != null)
        #unconfirmedPaymentsCount: unconfirmedPaymentsCount,
      if (nextPayment != null) #nextPayment: nextPayment,
      if (lastPaidPayment != $none) #lastPaidPayment: lastPaidPayment,
    }),
  );
  @override
  PaymentsUiState $make(CopyWithData data) => PaymentsUiState(
    status: data.get(#status, or: $value.status),
    payments: data.get(#payments, or: $value.payments),
    confirmedPaymentsCount: data.get(
      #confirmedPaymentsCount,
      or: $value.confirmedPaymentsCount,
    ),
    unconfirmedPaymentsCount: data.get(
      #unconfirmedPaymentsCount,
      or: $value.unconfirmedPaymentsCount,
    ),
    nextPayment: data.get(#nextPayment, or: $value.nextPayment),
    lastPaidPayment: data.get(#lastPaidPayment, or: $value.lastPaidPayment),
  );

  @override
  PaymentsUiStateCopyWith<$R2, PaymentsUiState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PaymentsUiStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

