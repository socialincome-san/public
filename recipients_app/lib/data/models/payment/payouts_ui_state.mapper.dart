// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payouts_ui_state.dart';

class PayoutsUiStateMapper extends ClassMapperBase<PayoutsUiState> {
  PayoutsUiStateMapper._();

  static PayoutsUiStateMapper? _instance;
  static PayoutsUiStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutsUiStateMapper._());
      MappedPayoutMapper.ensureInitialized();
      NextPayoutDataMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PayoutsUiState';

  static BalanceCardStatus _$status(PayoutsUiState v) => v.status;
  static const Field<PayoutsUiState, BalanceCardStatus> _f$status = Field(
    'status',
    _$status,
  );
  static List<MappedPayout> _$payouts(PayoutsUiState v) => v.payouts;
  static const Field<PayoutsUiState, List<MappedPayout>> _f$payouts = Field(
    'payouts',
    _$payouts,
    opt: true,
    def: const [],
  );
  static int _$confirmedPayoutsCount(PayoutsUiState v) =>
      v.confirmedPayoutsCount;
  static const Field<PayoutsUiState, int> _f$confirmedPayoutsCount = Field(
    'confirmedPayoutsCount',
    _$confirmedPayoutsCount,
  );
  static int _$unconfirmedPayoutsCount(PayoutsUiState v) =>
      v.unconfirmedPayoutsCount;
  static const Field<PayoutsUiState, int> _f$unconfirmedPayoutsCount = Field(
    'unconfirmedPayoutsCount',
    _$unconfirmedPayoutsCount,
  );
  static NextPayoutData _$nextPayout(PayoutsUiState v) => v.nextPayout;
  static const Field<PayoutsUiState, NextPayoutData> _f$nextPayout = Field(
    'nextPayout',
    _$nextPayout,
  );
  static MappedPayout? _$lastPaidPayout(PayoutsUiState v) => v.lastPaidPayout;
  static const Field<PayoutsUiState, MappedPayout> _f$lastPaidPayout = Field(
    'lastPaidPayout',
    _$lastPaidPayout,
    opt: true,
  );

  @override
  final MappableFields<PayoutsUiState> fields = const {
    #status: _f$status,
    #payouts: _f$payouts,
    #confirmedPayoutsCount: _f$confirmedPayoutsCount,
    #unconfirmedPayoutsCount: _f$unconfirmedPayoutsCount,
    #nextPayout: _f$nextPayout,
    #lastPaidPayout: _f$lastPaidPayout,
  };

  static PayoutsUiState _instantiate(DecodingData data) {
    return PayoutsUiState(
      status: data.dec(_f$status),
      payouts: data.dec(_f$payouts),
      confirmedPayoutsCount: data.dec(_f$confirmedPayoutsCount),
      unconfirmedPayoutsCount: data.dec(_f$unconfirmedPayoutsCount),
      nextPayout: data.dec(_f$nextPayout),
      lastPaidPayout: data.dec(_f$lastPaidPayout),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PayoutsUiState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PayoutsUiState>(map);
  }

  static PayoutsUiState fromJson(String json) {
    return ensureInitialized().decodeJson<PayoutsUiState>(json);
  }
}

mixin PayoutsUiStateMappable {
  String toJson() {
    return PayoutsUiStateMapper.ensureInitialized().encodeJson<PayoutsUiState>(
      this as PayoutsUiState,
    );
  }

  Map<String, dynamic> toMap() {
    return PayoutsUiStateMapper.ensureInitialized().encodeMap<PayoutsUiState>(
      this as PayoutsUiState,
    );
  }

  PayoutsUiStateCopyWith<PayoutsUiState, PayoutsUiState, PayoutsUiState>
  get copyWith => _PayoutsUiStateCopyWithImpl<PayoutsUiState, PayoutsUiState>(
    this as PayoutsUiState,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return PayoutsUiStateMapper.ensureInitialized().stringifyValue(
      this as PayoutsUiState,
    );
  }

  @override
  bool operator ==(Object other) {
    return PayoutsUiStateMapper.ensureInitialized().equalsValue(
      this as PayoutsUiState,
      other,
    );
  }

  @override
  int get hashCode {
    return PayoutsUiStateMapper.ensureInitialized().hashValue(
      this as PayoutsUiState,
    );
  }
}

extension PayoutsUiStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PayoutsUiState, $Out> {
  PayoutsUiStateCopyWith<$R, PayoutsUiState, $Out> get $asPayoutsUiState =>
      $base.as((v, t, t2) => _PayoutsUiStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PayoutsUiStateCopyWith<$R, $In extends PayoutsUiState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  ListCopyWith<
    $R,
    MappedPayout,
    MappedPayoutCopyWith<$R, MappedPayout, MappedPayout>
  >
  get payouts;
  NextPayoutDataCopyWith<$R, NextPayoutData, NextPayoutData> get nextPayout;
  MappedPayoutCopyWith<$R, MappedPayout, MappedPayout>? get lastPaidPayout;
  $R call({
    BalanceCardStatus? status,
    List<MappedPayout>? payouts,
    int? confirmedPayoutsCount,
    int? unconfirmedPayoutsCount,
    NextPayoutData? nextPayout,
    MappedPayout? lastPaidPayout,
  });
  PayoutsUiStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _PayoutsUiStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PayoutsUiState, $Out>
    implements PayoutsUiStateCopyWith<$R, PayoutsUiState, $Out> {
  _PayoutsUiStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PayoutsUiState> $mapper =
      PayoutsUiStateMapper.ensureInitialized();
  @override
  ListCopyWith<
    $R,
    MappedPayout,
    MappedPayoutCopyWith<$R, MappedPayout, MappedPayout>
  >
  get payouts => ListCopyWith(
    $value.payouts,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(payouts: v),
  );
  @override
  NextPayoutDataCopyWith<$R, NextPayoutData, NextPayoutData> get nextPayout =>
      $value.nextPayout.copyWith.$chain((v) => call(nextPayout: v));
  @override
  MappedPayoutCopyWith<$R, MappedPayout, MappedPayout>? get lastPaidPayout =>
      $value.lastPaidPayout?.copyWith.$chain((v) => call(lastPaidPayout: v));
  @override
  $R call({
    BalanceCardStatus? status,
    List<MappedPayout>? payouts,
    int? confirmedPayoutsCount,
    int? unconfirmedPayoutsCount,
    NextPayoutData? nextPayout,
    Object? lastPaidPayout = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (payouts != null) #payouts: payouts,
      if (confirmedPayoutsCount != null)
        #confirmedPayoutsCount: confirmedPayoutsCount,
      if (unconfirmedPayoutsCount != null)
        #unconfirmedPayoutsCount: unconfirmedPayoutsCount,
      if (nextPayout != null) #nextPayout: nextPayout,
      if (lastPaidPayout != $none) #lastPaidPayout: lastPaidPayout,
    }),
  );
  @override
  PayoutsUiState $make(CopyWithData data) => PayoutsUiState(
    status: data.get(#status, or: $value.status),
    payouts: data.get(#payouts, or: $value.payouts),
    confirmedPayoutsCount: data.get(
      #confirmedPayoutsCount,
      or: $value.confirmedPayoutsCount,
    ),
    unconfirmedPayoutsCount: data.get(
      #unconfirmedPayoutsCount,
      or: $value.unconfirmedPayoutsCount,
    ),
    nextPayout: data.get(#nextPayout, or: $value.nextPayout),
    lastPaidPayout: data.get(#lastPaidPayout, or: $value.lastPaidPayout),
  );

  @override
  PayoutsUiStateCopyWith<$R2, PayoutsUiState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PayoutsUiStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

