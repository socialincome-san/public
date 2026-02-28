// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payouts_cubit.dart';

class PayoutsStatusMapper extends EnumMapper<PayoutsStatus> {
  PayoutsStatusMapper._();

  static PayoutsStatusMapper? _instance;
  static PayoutsStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutsStatusMapper._());
    }
    return _instance!;
  }

  static PayoutsStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  PayoutsStatus decode(dynamic value) {
    switch (value) {
      case r'initial':
        return PayoutsStatus.initial;
      case r'loading':
        return PayoutsStatus.loading;
      case r'success':
        return PayoutsStatus.success;
      case r'updated':
        return PayoutsStatus.updated;
      case r'failure':
        return PayoutsStatus.failure;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(PayoutsStatus self) {
    switch (self) {
      case PayoutsStatus.initial:
        return r'initial';
      case PayoutsStatus.loading:
        return r'loading';
      case PayoutsStatus.success:
        return r'success';
      case PayoutsStatus.updated:
        return r'updated';
      case PayoutsStatus.failure:
        return r'failure';
    }
  }
}

extension PayoutsStatusMapperExtension on PayoutsStatus {
  String toValue() {
    PayoutsStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<PayoutsStatus>(this) as String;
  }
}

class PayoutsStateMapper extends ClassMapperBase<PayoutsState> {
  PayoutsStateMapper._();

  static PayoutsStateMapper? _instance;
  static PayoutsStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = PayoutsStateMapper._());
      PayoutsStatusMapper.ensureInitialized();
      PayoutsUiStateMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'PayoutsState';

  static PayoutsStatus _$status(PayoutsState v) => v.status;
  static const Field<PayoutsState, PayoutsStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: PayoutsStatus.initial,
  );
  static PayoutsUiState? _$payoutsUiState(PayoutsState v) => v.payoutsUiState;
  static const Field<PayoutsState, PayoutsUiState> _f$payoutsUiState = Field(
    'payoutsUiState',
    _$payoutsUiState,
    opt: true,
  );
  static Exception? _$exception(PayoutsState v) => v.exception;
  static const Field<PayoutsState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<PayoutsState> fields = const {
    #status: _f$status,
    #payoutsUiState: _f$payoutsUiState,
    #exception: _f$exception,
  };

  static PayoutsState _instantiate(DecodingData data) {
    return PayoutsState(
      status: data.dec(_f$status),
      payoutsUiState: data.dec(_f$payoutsUiState),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PayoutsState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PayoutsState>(map);
  }

  static PayoutsState fromJson(String json) {
    return ensureInitialized().decodeJson<PayoutsState>(json);
  }
}

mixin PayoutsStateMappable {
  String toJson() {
    return PayoutsStateMapper.ensureInitialized().encodeJson<PayoutsState>(
      this as PayoutsState,
    );
  }

  Map<String, dynamic> toMap() {
    return PayoutsStateMapper.ensureInitialized().encodeMap<PayoutsState>(
      this as PayoutsState,
    );
  }

  PayoutsStateCopyWith<PayoutsState, PayoutsState, PayoutsState> get copyWith =>
      _PayoutsStateCopyWithImpl<PayoutsState, PayoutsState>(
        this as PayoutsState,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return PayoutsStateMapper.ensureInitialized().stringifyValue(
      this as PayoutsState,
    );
  }

  @override
  bool operator ==(Object other) {
    return PayoutsStateMapper.ensureInitialized().equalsValue(
      this as PayoutsState,
      other,
    );
  }

  @override
  int get hashCode {
    return PayoutsStateMapper.ensureInitialized().hashValue(
      this as PayoutsState,
    );
  }
}

extension PayoutsStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PayoutsState, $Out> {
  PayoutsStateCopyWith<$R, PayoutsState, $Out> get $asPayoutsState =>
      $base.as((v, t, t2) => _PayoutsStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class PayoutsStateCopyWith<$R, $In extends PayoutsState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PayoutsUiStateCopyWith<$R, PayoutsUiState, PayoutsUiState>?
  get payoutsUiState;
  $R call({
    PayoutsStatus? status,
    PayoutsUiState? payoutsUiState,
    Exception? exception,
  });
  PayoutsStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _PayoutsStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PayoutsState, $Out>
    implements PayoutsStateCopyWith<$R, PayoutsState, $Out> {
  _PayoutsStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PayoutsState> $mapper =
      PayoutsStateMapper.ensureInitialized();
  @override
  PayoutsUiStateCopyWith<$R, PayoutsUiState, PayoutsUiState>?
  get payoutsUiState =>
      $value.payoutsUiState?.copyWith.$chain((v) => call(payoutsUiState: v));
  @override
  $R call({
    PayoutsStatus? status,
    Object? payoutsUiState = $none,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (payoutsUiState != $none) #payoutsUiState: payoutsUiState,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  PayoutsState $make(CopyWithData data) => PayoutsState(
    status: data.get(#status, or: $value.status),
    payoutsUiState: data.get(#payoutsUiState, or: $value.payoutsUiState),
    exception: data.get(#exception, or: $value.exception),
  );

  @override
  PayoutsStateCopyWith<$R2, PayoutsState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _PayoutsStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

