// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payout_params.dart';

class PayoutParamsMapper extends ClassMapperBase<PayoutParams> {
  PayoutParamsMapper._();

  static PayoutParamsMapper? _instance;
  static PayoutParamsMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutParamsMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'PayoutParams';

  static String _$payoutId(PayoutParams v) => v.payoutId;
  static const Field<PayoutParams, String> _f$payoutId = Field(
    'payoutId',
    _$payoutId,
  );

  @override
  final MappableFields<PayoutParams> fields = const {#payoutId: _f$payoutId};

  static PayoutParams _instantiate(DecodingData data) {
    return PayoutParams(payoutId: data.dec(_f$payoutId));
  }

  @override
  final Function instantiate = _instantiate;

  static PayoutParams fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PayoutParams>(map);
  }

  static PayoutParams fromJson(String json) {
    return ensureInitialized().decodeJson<PayoutParams>(json);
  }
}

mixin PayoutParamsMappable {
  String toJson() {
    return PayoutParamsMapper.ensureInitialized().encodeJson<PayoutParams>(
      this as PayoutParams,
    );
  }

  Map<String, dynamic> toMap() {
    return PayoutParamsMapper.ensureInitialized().encodeMap<PayoutParams>(
      this as PayoutParams,
    );
  }

  PayoutParamsCopyWith<PayoutParams, PayoutParams, PayoutParams> get copyWith =>
      _PayoutParamsCopyWithImpl<PayoutParams, PayoutParams>(
        this as PayoutParams,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return PayoutParamsMapper.ensureInitialized().stringifyValue(
      this as PayoutParams,
    );
  }

  @override
  bool operator ==(Object other) {
    return PayoutParamsMapper.ensureInitialized().equalsValue(
      this as PayoutParams,
      other,
    );
  }

  @override
  int get hashCode {
    return PayoutParamsMapper.ensureInitialized().hashValue(
      this as PayoutParams,
    );
  }
}

extension PayoutParamsValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PayoutParams, $Out> {
  PayoutParamsCopyWith<$R, PayoutParams, $Out> get $asPayoutParams =>
      $base.as((v, t, t2) => _PayoutParamsCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PayoutParamsCopyWith<$R, $In extends PayoutParams, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? payoutId});
  PayoutParamsCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PayoutParamsCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PayoutParams, $Out>
    implements PayoutParamsCopyWith<$R, PayoutParams, $Out> {
  _PayoutParamsCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PayoutParams> $mapper =
      PayoutParamsMapper.ensureInitialized();
  @override
  $R call({String? payoutId}) =>
      $apply(FieldCopyWithData({if (payoutId != null) #payoutId: payoutId}));
  @override
  PayoutParams $make(CopyWithData data) =>
      PayoutParams(payoutId: data.get(#payoutId, or: $value.payoutId));

  @override
  PayoutParamsCopyWith<$R2, PayoutParams, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PayoutParamsCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

