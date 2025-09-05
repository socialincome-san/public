// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'next_payment_data.dart';

class NextPaymentDataMapper extends ClassMapperBase<NextPaymentData> {
  NextPaymentDataMapper._();

  static NextPaymentDataMapper? _instance;
  static NextPaymentDataMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = NextPaymentDataMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'NextPaymentData';

  static int _$amount(NextPaymentData v) => v.amount;
  static const Field<NextPaymentData, int> _f$amount = Field(
    'amount',
    _$amount,
  );
  static String _$currency(NextPaymentData v) => v.currency;
  static const Field<NextPaymentData, String> _f$currency = Field(
    'currency',
    _$currency,
  );
  static int _$daysToPayment(NextPaymentData v) => v.daysToPayment;
  static const Field<NextPaymentData, int> _f$daysToPayment = Field(
    'daysToPayment',
    _$daysToPayment,
  );

  @override
  final MappableFields<NextPaymentData> fields = const {
    #amount: _f$amount,
    #currency: _f$currency,
    #daysToPayment: _f$daysToPayment,
  };

  static NextPaymentData _instantiate(DecodingData data) {
    return NextPaymentData(
      amount: data.dec(_f$amount),
      currency: data.dec(_f$currency),
      daysToPayment: data.dec(_f$daysToPayment),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static NextPaymentData fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<NextPaymentData>(map);
  }

  static NextPaymentData fromJson(String json) {
    return ensureInitialized().decodeJson<NextPaymentData>(json);
  }
}

mixin NextPaymentDataMappable {
  String toJson() {
    return NextPaymentDataMapper.ensureInitialized()
        .encodeJson<NextPaymentData>(this as NextPaymentData);
  }

  Map<String, dynamic> toMap() {
    return NextPaymentDataMapper.ensureInitialized().encodeMap<NextPaymentData>(
      this as NextPaymentData,
    );
  }

  NextPaymentDataCopyWith<NextPaymentData, NextPaymentData, NextPaymentData>
  get copyWith =>
      _NextPaymentDataCopyWithImpl<NextPaymentData, NextPaymentData>(
        this as NextPaymentData,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return NextPaymentDataMapper.ensureInitialized().stringifyValue(
      this as NextPaymentData,
    );
  }

  @override
  bool operator ==(Object other) {
    return NextPaymentDataMapper.ensureInitialized().equalsValue(
      this as NextPaymentData,
      other,
    );
  }

  @override
  int get hashCode {
    return NextPaymentDataMapper.ensureInitialized().hashValue(
      this as NextPaymentData,
    );
  }
}

extension NextPaymentDataValueCopy<$R, $Out>
    on ObjectCopyWith<$R, NextPaymentData, $Out> {
  NextPaymentDataCopyWith<$R, NextPaymentData, $Out> get $asNextPaymentData =>
      $base.as((v, t, t2) => _NextPaymentDataCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class NextPaymentDataCopyWith<$R, $In extends NextPaymentData, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({int? amount, String? currency, int? daysToPayment});
  NextPaymentDataCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _NextPaymentDataCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, NextPaymentData, $Out>
    implements NextPaymentDataCopyWith<$R, NextPaymentData, $Out> {
  _NextPaymentDataCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<NextPaymentData> $mapper =
      NextPaymentDataMapper.ensureInitialized();
  @override
  $R call({int? amount, String? currency, int? daysToPayment}) => $apply(
    FieldCopyWithData({
      if (amount != null) #amount: amount,
      if (currency != null) #currency: currency,
      if (daysToPayment != null) #daysToPayment: daysToPayment,
    }),
  );
  @override
  NextPaymentData $make(CopyWithData data) => NextPaymentData(
    amount: data.get(#amount, or: $value.amount),
    currency: data.get(#currency, or: $value.currency),
    daysToPayment: data.get(#daysToPayment, or: $value.daysToPayment),
  );

  @override
  NextPaymentDataCopyWith<$R2, NextPaymentData, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _NextPaymentDataCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

