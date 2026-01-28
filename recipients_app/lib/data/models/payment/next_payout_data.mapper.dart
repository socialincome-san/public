// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'next_payout_data.dart';

class NextPayoutDataMapper extends ClassMapperBase<NextPayoutData> {
  NextPayoutDataMapper._();

  static NextPayoutDataMapper? _instance;
  static NextPayoutDataMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = NextPayoutDataMapper._());
      CurrencyMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'NextPayoutData';

  static int _$amount(NextPayoutData v) => v.amount;
  static const Field<NextPayoutData, int> _f$amount = Field('amount', _$amount);
  static Currency _$currency(NextPayoutData v) => v.currency;
  static const Field<NextPayoutData, Currency> _f$currency = Field(
    'currency',
    _$currency,
  );
  static int _$daysToPayout(NextPayoutData v) => v.daysToPayout;
  static const Field<NextPayoutData, int> _f$daysToPayout = Field(
    'daysToPayout',
    _$daysToPayout,
  );

  @override
  final MappableFields<NextPayoutData> fields = const {
    #amount: _f$amount,
    #currency: _f$currency,
    #daysToPayout: _f$daysToPayout,
  };

  static NextPayoutData _instantiate(DecodingData data) {
    return NextPayoutData(
      amount: data.dec(_f$amount),
      currency: data.dec(_f$currency),
      daysToPayout: data.dec(_f$daysToPayout),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static NextPayoutData fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<NextPayoutData>(map);
  }

  static NextPayoutData fromJson(String json) {
    return ensureInitialized().decodeJson<NextPayoutData>(json);
  }
}

mixin NextPayoutDataMappable {
  String toJson() {
    return NextPayoutDataMapper.ensureInitialized().encodeJson<NextPayoutData>(
      this as NextPayoutData,
    );
  }

  Map<String, dynamic> toMap() {
    return NextPayoutDataMapper.ensureInitialized().encodeMap<NextPayoutData>(
      this as NextPayoutData,
    );
  }

  NextPayoutDataCopyWith<NextPayoutData, NextPayoutData, NextPayoutData>
  get copyWith => _NextPayoutDataCopyWithImpl<NextPayoutData, NextPayoutData>(
    this as NextPayoutData,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return NextPayoutDataMapper.ensureInitialized().stringifyValue(
      this as NextPayoutData,
    );
  }

  @override
  bool operator ==(Object other) {
    return NextPayoutDataMapper.ensureInitialized().equalsValue(
      this as NextPayoutData,
      other,
    );
  }

  @override
  int get hashCode {
    return NextPayoutDataMapper.ensureInitialized().hashValue(
      this as NextPayoutData,
    );
  }
}

extension NextPayoutDataValueCopy<$R, $Out>
    on ObjectCopyWith<$R, NextPayoutData, $Out> {
  NextPayoutDataCopyWith<$R, NextPayoutData, $Out> get $asNextPayoutData =>
      $base.as((v, t, t2) => _NextPayoutDataCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class NextPayoutDataCopyWith<$R, $In extends NextPayoutData, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({int? amount, Currency? currency, int? daysToPayout});
  NextPayoutDataCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _NextPayoutDataCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, NextPayoutData, $Out>
    implements NextPayoutDataCopyWith<$R, NextPayoutData, $Out> {
  _NextPayoutDataCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<NextPayoutData> $mapper =
      NextPayoutDataMapper.ensureInitialized();
  @override
  $R call({int? amount, Currency? currency, int? daysToPayout}) => $apply(
    FieldCopyWithData({
      if (amount != null) #amount: amount,
      if (currency != null) #currency: currency,
      if (daysToPayout != null) #daysToPayout: daysToPayout,
    }),
  );
  @override
  NextPayoutData $make(CopyWithData data) => NextPayoutData(
    amount: data.get(#amount, or: $value.amount),
    currency: data.get(#currency, or: $value.currency),
    daysToPayout: data.get(#daysToPayout, or: $value.daysToPayout),
  );

  @override
  NextPayoutDataCopyWith<$R2, NextPayoutData, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _NextPayoutDataCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

