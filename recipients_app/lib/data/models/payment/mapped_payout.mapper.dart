// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'mapped_payout.dart';

class MappedPayoutMapper extends ClassMapperBase<MappedPayout> {
  MappedPayoutMapper._();

  static MappedPayoutMapper? _instance;
  static MappedPayoutMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = MappedPayoutMapper._());
      PayoutMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'MappedPayout';

  static Payout _$payout(MappedPayout v) => v.payout;
  static const Field<MappedPayout, Payout> _f$payout = Field(
    'payout',
    _$payout,
  );
  static PayoutUiStatus _$uiStatus(MappedPayout v) => v.uiStatus;
  static const Field<MappedPayout, PayoutUiStatus> _f$uiStatus = Field(
    'uiStatus',
    _$uiStatus,
  );

  @override
  final MappableFields<MappedPayout> fields = const {
    #payout: _f$payout,
    #uiStatus: _f$uiStatus,
  };

  static MappedPayout _instantiate(DecodingData data) {
    return MappedPayout(
      payout: data.dec(_f$payout),
      uiStatus: data.dec(_f$uiStatus),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static MappedPayout fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<MappedPayout>(map);
  }

  static MappedPayout fromJson(String json) {
    return ensureInitialized().decodeJson<MappedPayout>(json);
  }
}

mixin MappedPayoutMappable {
  String toJson() {
    return MappedPayoutMapper.ensureInitialized().encodeJson<MappedPayout>(
      this as MappedPayout,
    );
  }

  Map<String, dynamic> toMap() {
    return MappedPayoutMapper.ensureInitialized().encodeMap<MappedPayout>(
      this as MappedPayout,
    );
  }

  MappedPayoutCopyWith<MappedPayout, MappedPayout, MappedPayout> get copyWith =>
      _MappedPayoutCopyWithImpl<MappedPayout, MappedPayout>(
        this as MappedPayout,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return MappedPayoutMapper.ensureInitialized().stringifyValue(
      this as MappedPayout,
    );
  }

  @override
  bool operator ==(Object other) {
    return MappedPayoutMapper.ensureInitialized().equalsValue(
      this as MappedPayout,
      other,
    );
  }

  @override
  int get hashCode {
    return MappedPayoutMapper.ensureInitialized().hashValue(
      this as MappedPayout,
    );
  }
}

extension MappedPayoutValueCopy<$R, $Out>
    on ObjectCopyWith<$R, MappedPayout, $Out> {
  MappedPayoutCopyWith<$R, MappedPayout, $Out> get $asMappedPayout =>
      $base.as((v, t, t2) => _MappedPayoutCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class MappedPayoutCopyWith<$R, $In extends MappedPayout, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  PayoutCopyWith<$R, Payout, Payout> get payout;
  $R call({Payout? payout, PayoutUiStatus? uiStatus});
  MappedPayoutCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _MappedPayoutCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, MappedPayout, $Out>
    implements MappedPayoutCopyWith<$R, MappedPayout, $Out> {
  _MappedPayoutCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<MappedPayout> $mapper =
      MappedPayoutMapper.ensureInitialized();
  @override
  PayoutCopyWith<$R, Payout, Payout> get payout =>
      $value.payout.copyWith.$chain((v) => call(payout: v));
  @override
  $R call({Payout? payout, PayoutUiStatus? uiStatus}) => $apply(
    FieldCopyWithData({
      if (payout != null) #payout: payout,
      if (uiStatus != null) #uiStatus: uiStatus,
    }),
  );
  @override
  MappedPayout $make(CopyWithData data) => MappedPayout(
    payout: data.get(#payout, or: $value.payout),
    uiStatus: data.get(#uiStatus, or: $value.uiStatus),
  );

  @override
  MappedPayoutCopyWith<$R2, MappedPayout, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _MappedPayoutCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

