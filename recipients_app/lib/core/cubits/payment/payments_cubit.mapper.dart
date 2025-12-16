// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payments_cubit.dart';

class PaymentsStatusMapper extends EnumMapper<PaymentsStatus> {
  PaymentsStatusMapper._();

  static PaymentsStatusMapper? _instance;
  static PaymentsStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentsStatusMapper._());
    }
    return _instance!;
  }

  static PaymentsStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PaymentsStatus decode(dynamic value) {
    switch (value) {
      case r'initial':
        return PaymentsStatus.initial;
      case r'loading':
        return PaymentsStatus.loading;
      case r'success':
        return PaymentsStatus.success;
      case r'updated':
        return PaymentsStatus.updated;
      case r'failure':
        return PaymentsStatus.failure;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PaymentsStatus self) {
    switch (self) {
      case PaymentsStatus.initial:
        return r'initial';
      case PaymentsStatus.loading:
        return r'loading';
      case PaymentsStatus.success:
        return r'success';
      case PaymentsStatus.updated:
        return r'updated';
      case PaymentsStatus.failure:
        return r'failure';
    }
  }
}

extension PaymentsStatusMapperExtension on PaymentsStatus {
  String toValue() {
    PaymentsStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PaymentsStatus>(this) as String;
  }
}

class PaymentsStateMapper extends ClassMapperBase<PaymentsState> {
  PaymentsStateMapper._();

  static PaymentsStateMapper? _instance;
  static PaymentsStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PaymentsStateMapper._());
      PaymentsStatusMapper.ensureInitialized();
      PaymentsUiStateMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PaymentsState';

  static PaymentsStatus _$status(PaymentsState v) => v.status;
  static const Field<PaymentsState, PaymentsStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: PaymentsStatus.initial,
  );
  static PaymentsUiState? _$paymentsUiState(PaymentsState v) =>
      v.paymentsUiState;
  static const Field<PaymentsState, PaymentsUiState> _f$paymentsUiState = Field(
    'paymentsUiState',
    _$paymentsUiState,
    opt: true,
  );
  static Exception? _$exception(PaymentsState v) => v.exception;
  static const Field<PaymentsState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<PaymentsState> fields = const {
    #status: _f$status,
    #paymentsUiState: _f$paymentsUiState,
    #exception: _f$exception,
  };

  static PaymentsState _instantiate(DecodingData data) {
    return PaymentsState(
      status: data.dec(_f$status),
      paymentsUiState: data.dec(_f$paymentsUiState),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PaymentsState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PaymentsState>(map);
  }

  static PaymentsState fromJson(String json) {
    return ensureInitialized().decodeJson<PaymentsState>(json);
  }
}

mixin PaymentsStateMappable {
  String toJson() {
    return PaymentsStateMapper.ensureInitialized().encodeJson<PaymentsState>(
      this as PaymentsState,
    );
  }

  Map<String, dynamic> toMap() {
    return PaymentsStateMapper.ensureInitialized().encodeMap<PaymentsState>(
      this as PaymentsState,
    );
  }

  PaymentsStateCopyWith<PaymentsState, PaymentsState, PaymentsState>
  get copyWith => _PaymentsStateCopyWithImpl<PaymentsState, PaymentsState>(
    this as PaymentsState,
    $identity,
    $identity,
  );
  @override
  String toString() {
    return PaymentsStateMapper.ensureInitialized().stringifyValue(
      this as PaymentsState,
    );
  }

  @override
  bool operator ==(Object other) {
    return PaymentsStateMapper.ensureInitialized().equalsValue(
      this as PaymentsState,
      other,
    );
  }

  @override
  int get hashCode {
    return PaymentsStateMapper.ensureInitialized().hashValue(
      this as PaymentsState,
    );
  }
}

extension PaymentsStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PaymentsState, $Out> {
  PaymentsStateCopyWith<$R, PaymentsState, $Out> get $asPaymentsState =>
      $base.as((v, t, t2) => _PaymentsStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PaymentsStateCopyWith<$R, $In extends PaymentsState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PaymentsUiStateCopyWith<$R, PaymentsUiState, PaymentsUiState>?
  get paymentsUiState;
  $R call({
    PaymentsStatus? status,
    PaymentsUiState? paymentsUiState,
    Exception? exception,
  });
  PaymentsStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PaymentsStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PaymentsState, $Out>
    implements PaymentsStateCopyWith<$R, PaymentsState, $Out> {
  _PaymentsStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PaymentsState> $mapper =
      PaymentsStateMapper.ensureInitialized();
  @override
  PaymentsUiStateCopyWith<$R, PaymentsUiState, PaymentsUiState>?
  get paymentsUiState =>
      $value.paymentsUiState?.copyWith.$chain((v) => call(paymentsUiState: v));
  @override
  $R call({
    PaymentsStatus? status,
    Object? paymentsUiState = $none,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (paymentsUiState != $none) #paymentsUiState: paymentsUiState,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  PaymentsState $make(CopyWithData data) => PaymentsState(
    status: data.get(#status, or: $value.status),
    paymentsUiState: data.get(#paymentsUiState, or: $value.paymentsUiState),
    exception: data.get(#exception, or: $value.exception),
  );

  @override
  PaymentsStateCopyWith<$R2, PaymentsState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PaymentsStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

