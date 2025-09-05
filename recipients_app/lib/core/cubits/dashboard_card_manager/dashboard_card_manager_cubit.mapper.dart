// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'dashboard_card_manager_cubit.dart';

class DashboardCardManagerStateMapper
    extends ClassMapperBase<DashboardCardManagerState> {
  DashboardCardManagerStateMapper._();

  static DashboardCardManagerStateMapper? _instance;
  static DashboardCardManagerStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = DashboardCardManagerStateMapper._(),
      );
    }
    return _instance!;
  }

  @override
  final String id = 'DashboardCardManagerState';

  static DashboardCardManagerStatus _$status(DashboardCardManagerState v) =>
      v.status;
  static const Field<DashboardCardManagerState, DashboardCardManagerStatus>
  _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: DashboardCardManagerStatus.initial,
  );
  static List<DashboardCard> _$cards(DashboardCardManagerState v) => v.cards;
  static const Field<DashboardCardManagerState, List<DashboardCard>> _f$cards =
      Field('cards', _$cards, opt: true, def: const []);
  static Exception? _$exception(DashboardCardManagerState v) => v.exception;
  static const Field<DashboardCardManagerState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<DashboardCardManagerState> fields = const {
    #status: _f$status,
    #cards: _f$cards,
    #exception: _f$exception,
  };

  static DashboardCardManagerState _instantiate(DecodingData data) {
    return DashboardCardManagerState(
      status: data.dec(_f$status),
      cards: data.dec(_f$cards),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static DashboardCardManagerState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<DashboardCardManagerState>(map);
  }

  static DashboardCardManagerState fromJson(String json) {
    return ensureInitialized().decodeJson<DashboardCardManagerState>(json);
  }
}

mixin DashboardCardManagerStateMappable {
  String toJson() {
    return DashboardCardManagerStateMapper.ensureInitialized()
        .encodeJson<DashboardCardManagerState>(
          this as DashboardCardManagerState,
        );
  }

  Map<String, dynamic> toMap() {
    return DashboardCardManagerStateMapper.ensureInitialized()
        .encodeMap<DashboardCardManagerState>(
          this as DashboardCardManagerState,
        );
  }

  DashboardCardManagerStateCopyWith<
    DashboardCardManagerState,
    DashboardCardManagerState,
    DashboardCardManagerState
  >
  get copyWith =>
      _DashboardCardManagerStateCopyWithImpl<
        DashboardCardManagerState,
        DashboardCardManagerState
      >(this as DashboardCardManagerState, $identity, $identity);
  @override
  String toString() {
    return DashboardCardManagerStateMapper.ensureInitialized().stringifyValue(
      this as DashboardCardManagerState,
    );
  }

  @override
  bool operator ==(Object other) {
    return DashboardCardManagerStateMapper.ensureInitialized().equalsValue(
      this as DashboardCardManagerState,
      other,
    );
  }

  @override
  int get hashCode {
    return DashboardCardManagerStateMapper.ensureInitialized().hashValue(
      this as DashboardCardManagerState,
    );
  }
}

extension DashboardCardManagerStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, DashboardCardManagerState, $Out> {
  DashboardCardManagerStateCopyWith<$R, DashboardCardManagerState, $Out>
  get $asDashboardCardManagerState => $base.as(
    (v, t, t2) => _DashboardCardManagerStateCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class DashboardCardManagerStateCopyWith<
  $R,
  $In extends DashboardCardManagerState,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  ListCopyWith<
    $R,
    DashboardCard,
    ObjectCopyWith<$R, DashboardCard, DashboardCard>
  >
  get cards;
  $R call({
    DashboardCardManagerStatus? status,
    List<DashboardCard>? cards,
    Exception? exception,
  });
  DashboardCardManagerStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _DashboardCardManagerStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, DashboardCardManagerState, $Out>
    implements
        DashboardCardManagerStateCopyWith<$R, DashboardCardManagerState, $Out> {
  _DashboardCardManagerStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<DashboardCardManagerState> $mapper =
      DashboardCardManagerStateMapper.ensureInitialized();
  @override
  ListCopyWith<
    $R,
    DashboardCard,
    ObjectCopyWith<$R, DashboardCard, DashboardCard>
  >
  get cards => ListCopyWith(
    $value.cards,
    (v, t) => ObjectCopyWith(v, $identity, t),
    (v) => call(cards: v),
  );
  @override
  $R call({
    DashboardCardManagerStatus? status,
    List<DashboardCard>? cards,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (cards != null) #cards: cards,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  DashboardCardManagerState $make(CopyWithData data) =>
      DashboardCardManagerState(
        status: data.get(#status, or: $value.status),
        cards: data.get(#cards, or: $value.cards),
        exception: data.get(#exception, or: $value.exception),
      );

  @override
  DashboardCardManagerStateCopyWith<$R2, DashboardCardManagerState, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _DashboardCardManagerStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

