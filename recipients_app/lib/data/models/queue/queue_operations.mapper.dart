// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'queue_operations.dart';

class QueuedOperationMapper extends ClassMapperBase<QueuedOperation> {
  QueuedOperationMapper._();

  static QueuedOperationMapper? _instance;
  static QueuedOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = QueuedOperationMapper._());
      ConfirmPaymentOperationMapper.ensureInitialized();
      ContestPaymentOperationMapper.ensureInitialized();
      UpdateRecipientOperationMapper.ensureInitialized();
      UpdatePaymentNumberOperationMapper.ensureInitialized();
      UpdateContactNumberOperationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'QueuedOperation';

  static QueueOperationType _$type(QueuedOperation v) => v.type;
  static const Field<QueuedOperation, QueueOperationType> _f$type = Field(
    'type',
    _$type,
  );

  @override
  final MappableFields<QueuedOperation> fields = const {#type: _f$type};

  static QueuedOperation _instantiate(DecodingData data) {
    throw MapperException.missingConstructor('QueuedOperation');
  }

  @override
  final Function instantiate = _instantiate;

  static QueuedOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<QueuedOperation>(map);
  }

  static QueuedOperation fromJson(String json) {
    return ensureInitialized().decodeJson<QueuedOperation>(json);
  }
}

mixin QueuedOperationMappable {
  String toJson();
  Map<String, dynamic> toMap();
  QueuedOperationCopyWith<QueuedOperation, QueuedOperation, QueuedOperation>
  get copyWith;
}

abstract class QueuedOperationCopyWith<$R, $In extends QueuedOperation, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call();
  QueuedOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class ConfirmPaymentOperationMapper
    extends ClassMapperBase<ConfirmPaymentOperation> {
  ConfirmPaymentOperationMapper._();

  static ConfirmPaymentOperationMapper? _instance;
  static ConfirmPaymentOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = ConfirmPaymentOperationMapper._(),
      );
      QueuedOperationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'ConfirmPaymentOperation';

  static String _$payoutId(ConfirmPaymentOperation v) => v.payoutId;
  static const Field<ConfirmPaymentOperation, String> _f$payoutId = Field(
    'payoutId',
    _$payoutId,
  );
  static QueueOperationType _$type(ConfirmPaymentOperation v) => v.type;
  static const Field<ConfirmPaymentOperation, QueueOperationType> _f$type =
      Field('type', _$type, mode: FieldMode.member);

  @override
  final MappableFields<ConfirmPaymentOperation> fields = const {
    #payoutId: _f$payoutId,
    #type: _f$type,
  };

  static ConfirmPaymentOperation _instantiate(DecodingData data) {
    return ConfirmPaymentOperation(payoutId: data.dec(_f$payoutId));
  }

  @override
  final Function instantiate = _instantiate;

  static ConfirmPaymentOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<ConfirmPaymentOperation>(map);
  }

  static ConfirmPaymentOperation fromJson(String json) {
    return ensureInitialized().decodeJson<ConfirmPaymentOperation>(json);
  }
}

mixin ConfirmPaymentOperationMappable {
  String toJson() {
    return ConfirmPaymentOperationMapper.ensureInitialized()
        .encodeJson<ConfirmPaymentOperation>(this as ConfirmPaymentOperation);
  }

  Map<String, dynamic> toMap() {
    return ConfirmPaymentOperationMapper.ensureInitialized()
        .encodeMap<ConfirmPaymentOperation>(this as ConfirmPaymentOperation);
  }

  ConfirmPaymentOperationCopyWith<
    ConfirmPaymentOperation,
    ConfirmPaymentOperation,
    ConfirmPaymentOperation
  >
  get copyWith =>
      _ConfirmPaymentOperationCopyWithImpl<
        ConfirmPaymentOperation,
        ConfirmPaymentOperation
      >(this as ConfirmPaymentOperation, $identity, $identity);
  @override
  String toString() {
    return ConfirmPaymentOperationMapper.ensureInitialized().stringifyValue(
      this as ConfirmPaymentOperation,
    );
  }

  @override
  bool operator ==(Object other) {
    return ConfirmPaymentOperationMapper.ensureInitialized().equalsValue(
      this as ConfirmPaymentOperation,
      other,
    );
  }

  @override
  int get hashCode {
    return ConfirmPaymentOperationMapper.ensureInitialized().hashValue(
      this as ConfirmPaymentOperation,
    );
  }
}

extension ConfirmPaymentOperationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, ConfirmPaymentOperation, $Out> {
  ConfirmPaymentOperationCopyWith<$R, ConfirmPaymentOperation, $Out>
  get $asConfirmPaymentOperation => $base.as(
    (v, t, t2) => _ConfirmPaymentOperationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class ConfirmPaymentOperationCopyWith<
  $R,
  $In extends ConfirmPaymentOperation,
  $Out
>
    implements QueuedOperationCopyWith<$R, $In, $Out> {
  @override
  $R call({String? payoutId});
  ConfirmPaymentOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _ConfirmPaymentOperationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, ConfirmPaymentOperation, $Out>
    implements
        ConfirmPaymentOperationCopyWith<$R, ConfirmPaymentOperation, $Out> {
  _ConfirmPaymentOperationCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<ConfirmPaymentOperation> $mapper =
      ConfirmPaymentOperationMapper.ensureInitialized();
  @override
  $R call({String? payoutId}) =>
      $apply(FieldCopyWithData({if (payoutId != null) #payoutId: payoutId}));
  @override
  ConfirmPaymentOperation $make(CopyWithData data) => ConfirmPaymentOperation(
    payoutId: data.get(#payoutId, or: $value.payoutId),
  );

  @override
  ConfirmPaymentOperationCopyWith<$R2, ConfirmPaymentOperation, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _ConfirmPaymentOperationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

class ContestPaymentOperationMapper
    extends ClassMapperBase<ContestPaymentOperation> {
  ContestPaymentOperationMapper._();

  static ContestPaymentOperationMapper? _instance;
  static ContestPaymentOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = ContestPaymentOperationMapper._(),
      );
      QueuedOperationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'ContestPaymentOperation';

  static String _$payoutId(ContestPaymentOperation v) => v.payoutId;
  static const Field<ContestPaymentOperation, String> _f$payoutId = Field(
    'payoutId',
    _$payoutId,
  );
  static String _$contestReason(ContestPaymentOperation v) => v.contestReason;
  static const Field<ContestPaymentOperation, String> _f$contestReason = Field(
    'contestReason',
    _$contestReason,
  );
  static QueueOperationType _$type(ContestPaymentOperation v) => v.type;
  static const Field<ContestPaymentOperation, QueueOperationType> _f$type =
      Field('type', _$type, mode: FieldMode.member);

  @override
  final MappableFields<ContestPaymentOperation> fields = const {
    #payoutId: _f$payoutId,
    #contestReason: _f$contestReason,
    #type: _f$type,
  };

  static ContestPaymentOperation _instantiate(DecodingData data) {
    return ContestPaymentOperation(
      payoutId: data.dec(_f$payoutId),
      contestReason: data.dec(_f$contestReason),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static ContestPaymentOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<ContestPaymentOperation>(map);
  }

  static ContestPaymentOperation fromJson(String json) {
    return ensureInitialized().decodeJson<ContestPaymentOperation>(json);
  }
}

mixin ContestPaymentOperationMappable {
  String toJson() {
    return ContestPaymentOperationMapper.ensureInitialized()
        .encodeJson<ContestPaymentOperation>(this as ContestPaymentOperation);
  }

  Map<String, dynamic> toMap() {
    return ContestPaymentOperationMapper.ensureInitialized()
        .encodeMap<ContestPaymentOperation>(this as ContestPaymentOperation);
  }

  ContestPaymentOperationCopyWith<
    ContestPaymentOperation,
    ContestPaymentOperation,
    ContestPaymentOperation
  >
  get copyWith =>
      _ContestPaymentOperationCopyWithImpl<
        ContestPaymentOperation,
        ContestPaymentOperation
      >(this as ContestPaymentOperation, $identity, $identity);
  @override
  String toString() {
    return ContestPaymentOperationMapper.ensureInitialized().stringifyValue(
      this as ContestPaymentOperation,
    );
  }

  @override
  bool operator ==(Object other) {
    return ContestPaymentOperationMapper.ensureInitialized().equalsValue(
      this as ContestPaymentOperation,
      other,
    );
  }

  @override
  int get hashCode {
    return ContestPaymentOperationMapper.ensureInitialized().hashValue(
      this as ContestPaymentOperation,
    );
  }
}

extension ContestPaymentOperationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, ContestPaymentOperation, $Out> {
  ContestPaymentOperationCopyWith<$R, ContestPaymentOperation, $Out>
  get $asContestPaymentOperation => $base.as(
    (v, t, t2) => _ContestPaymentOperationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class ContestPaymentOperationCopyWith<
  $R,
  $In extends ContestPaymentOperation,
  $Out
>
    implements QueuedOperationCopyWith<$R, $In, $Out> {
  @override
  $R call({String? payoutId, String? contestReason});
  ContestPaymentOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _ContestPaymentOperationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, ContestPaymentOperation, $Out>
    implements
        ContestPaymentOperationCopyWith<$R, ContestPaymentOperation, $Out> {
  _ContestPaymentOperationCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<ContestPaymentOperation> $mapper =
      ContestPaymentOperationMapper.ensureInitialized();
  @override
  $R call({String? payoutId, String? contestReason}) => $apply(
    FieldCopyWithData({
      if (payoutId != null) #payoutId: payoutId,
      if (contestReason != null) #contestReason: contestReason,
    }),
  );
  @override
  ContestPaymentOperation $make(CopyWithData data) => ContestPaymentOperation(
    payoutId: data.get(#payoutId, or: $value.payoutId),
    contestReason: data.get(#contestReason, or: $value.contestReason),
  );

  @override
  ContestPaymentOperationCopyWith<$R2, ContestPaymentOperation, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _ContestPaymentOperationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

class UpdateRecipientOperationMapper
    extends ClassMapperBase<UpdateRecipientOperation> {
  UpdateRecipientOperationMapper._();

  static UpdateRecipientOperationMapper? _instance;
  static UpdateRecipientOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = UpdateRecipientOperationMapper._(),
      );
      QueuedOperationMapper.ensureInitialized();
      RecipientSelfUpdateMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'UpdateRecipientOperation';

  static RecipientSelfUpdate _$selfUpdate(UpdateRecipientOperation v) =>
      v.selfUpdate;
  static const Field<UpdateRecipientOperation, RecipientSelfUpdate>
  _f$selfUpdate = Field('selfUpdate', _$selfUpdate);
  static QueueOperationType _$type(UpdateRecipientOperation v) => v.type;
  static const Field<UpdateRecipientOperation, QueueOperationType> _f$type =
      Field('type', _$type, mode: FieldMode.member);

  @override
  final MappableFields<UpdateRecipientOperation> fields = const {
    #selfUpdate: _f$selfUpdate,
    #type: _f$type,
  };

  static UpdateRecipientOperation _instantiate(DecodingData data) {
    return UpdateRecipientOperation(selfUpdate: data.dec(_f$selfUpdate));
  }

  @override
  final Function instantiate = _instantiate;

  static UpdateRecipientOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<UpdateRecipientOperation>(map);
  }

  static UpdateRecipientOperation fromJson(String json) {
    return ensureInitialized().decodeJson<UpdateRecipientOperation>(json);
  }
}

mixin UpdateRecipientOperationMappable {
  String toJson() {
    return UpdateRecipientOperationMapper.ensureInitialized()
        .encodeJson<UpdateRecipientOperation>(this as UpdateRecipientOperation);
  }

  Map<String, dynamic> toMap() {
    return UpdateRecipientOperationMapper.ensureInitialized()
        .encodeMap<UpdateRecipientOperation>(this as UpdateRecipientOperation);
  }

  UpdateRecipientOperationCopyWith<
    UpdateRecipientOperation,
    UpdateRecipientOperation,
    UpdateRecipientOperation
  >
  get copyWith =>
      _UpdateRecipientOperationCopyWithImpl<
        UpdateRecipientOperation,
        UpdateRecipientOperation
      >(this as UpdateRecipientOperation, $identity, $identity);
  @override
  String toString() {
    return UpdateRecipientOperationMapper.ensureInitialized().stringifyValue(
      this as UpdateRecipientOperation,
    );
  }

  @override
  bool operator ==(Object other) {
    return UpdateRecipientOperationMapper.ensureInitialized().equalsValue(
      this as UpdateRecipientOperation,
      other,
    );
  }

  @override
  int get hashCode {
    return UpdateRecipientOperationMapper.ensureInitialized().hashValue(
      this as UpdateRecipientOperation,
    );
  }
}

extension UpdateRecipientOperationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, UpdateRecipientOperation, $Out> {
  UpdateRecipientOperationCopyWith<$R, UpdateRecipientOperation, $Out>
  get $asUpdateRecipientOperation => $base.as(
    (v, t, t2) => _UpdateRecipientOperationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class UpdateRecipientOperationCopyWith<
  $R,
  $In extends UpdateRecipientOperation,
  $Out
>
    implements QueuedOperationCopyWith<$R, $In, $Out> {
  RecipientSelfUpdateCopyWith<$R, RecipientSelfUpdate, RecipientSelfUpdate>
  get selfUpdate;
  @override
  $R call({RecipientSelfUpdate? selfUpdate});
  UpdateRecipientOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _UpdateRecipientOperationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, UpdateRecipientOperation, $Out>
    implements
        UpdateRecipientOperationCopyWith<$R, UpdateRecipientOperation, $Out> {
  _UpdateRecipientOperationCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<UpdateRecipientOperation> $mapper =
      UpdateRecipientOperationMapper.ensureInitialized();
  @override
  RecipientSelfUpdateCopyWith<$R, RecipientSelfUpdate, RecipientSelfUpdate>
  get selfUpdate =>
      $value.selfUpdate.copyWith.$chain((v) => call(selfUpdate: v));
  @override
  $R call({RecipientSelfUpdate? selfUpdate}) => $apply(
    FieldCopyWithData({if (selfUpdate != null) #selfUpdate: selfUpdate}),
  );
  @override
  UpdateRecipientOperation $make(CopyWithData data) => UpdateRecipientOperation(
    selfUpdate: data.get(#selfUpdate, or: $value.selfUpdate),
  );

  @override
  UpdateRecipientOperationCopyWith<$R2, UpdateRecipientOperation, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _UpdateRecipientOperationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

class UpdatePaymentNumberOperationMapper
    extends ClassMapperBase<UpdatePaymentNumberOperation> {
  UpdatePaymentNumberOperationMapper._();

  static UpdatePaymentNumberOperationMapper? _instance;
  static UpdatePaymentNumberOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = UpdatePaymentNumberOperationMapper._(),
      );
      QueuedOperationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'UpdatePaymentNumberOperation';

  static String _$phoneNumber(UpdatePaymentNumberOperation v) => v.phoneNumber;
  static const Field<UpdatePaymentNumberOperation, String> _f$phoneNumber =
      Field('phoneNumber', _$phoneNumber);
  static QueueOperationType _$type(UpdatePaymentNumberOperation v) => v.type;
  static const Field<UpdatePaymentNumberOperation, QueueOperationType> _f$type =
      Field('type', _$type, mode: FieldMode.member);

  @override
  final MappableFields<UpdatePaymentNumberOperation> fields = const {
    #phoneNumber: _f$phoneNumber,
    #type: _f$type,
  };

  static UpdatePaymentNumberOperation _instantiate(DecodingData data) {
    return UpdatePaymentNumberOperation(phoneNumber: data.dec(_f$phoneNumber));
  }

  @override
  final Function instantiate = _instantiate;

  static UpdatePaymentNumberOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<UpdatePaymentNumberOperation>(map);
  }

  static UpdatePaymentNumberOperation fromJson(String json) {
    return ensureInitialized().decodeJson<UpdatePaymentNumberOperation>(json);
  }
}

mixin UpdatePaymentNumberOperationMappable {
  String toJson() {
    return UpdatePaymentNumberOperationMapper.ensureInitialized()
        .encodeJson<UpdatePaymentNumberOperation>(
          this as UpdatePaymentNumberOperation,
        );
  }

  Map<String, dynamic> toMap() {
    return UpdatePaymentNumberOperationMapper.ensureInitialized()
        .encodeMap<UpdatePaymentNumberOperation>(
          this as UpdatePaymentNumberOperation,
        );
  }

  UpdatePaymentNumberOperationCopyWith<
    UpdatePaymentNumberOperation,
    UpdatePaymentNumberOperation,
    UpdatePaymentNumberOperation
  >
  get copyWith =>
      _UpdatePaymentNumberOperationCopyWithImpl<
        UpdatePaymentNumberOperation,
        UpdatePaymentNumberOperation
      >(this as UpdatePaymentNumberOperation, $identity, $identity);
  @override
  String toString() {
    return UpdatePaymentNumberOperationMapper.ensureInitialized()
        .stringifyValue(this as UpdatePaymentNumberOperation);
  }

  @override
  bool operator ==(Object other) {
    return UpdatePaymentNumberOperationMapper.ensureInitialized().equalsValue(
      this as UpdatePaymentNumberOperation,
      other,
    );
  }

  @override
  int get hashCode {
    return UpdatePaymentNumberOperationMapper.ensureInitialized().hashValue(
      this as UpdatePaymentNumberOperation,
    );
  }
}

extension UpdatePaymentNumberOperationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, UpdatePaymentNumberOperation, $Out> {
  UpdatePaymentNumberOperationCopyWith<$R, UpdatePaymentNumberOperation, $Out>
  get $asUpdatePaymentNumberOperation => $base.as(
    (v, t, t2) => _UpdatePaymentNumberOperationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class UpdatePaymentNumberOperationCopyWith<
  $R,
  $In extends UpdatePaymentNumberOperation,
  $Out
>
    implements QueuedOperationCopyWith<$R, $In, $Out> {
  @override
  $R call({String? phoneNumber});
  UpdatePaymentNumberOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _UpdatePaymentNumberOperationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, UpdatePaymentNumberOperation, $Out>
    implements
        UpdatePaymentNumberOperationCopyWith<
          $R,
          UpdatePaymentNumberOperation,
          $Out
        > {
  _UpdatePaymentNumberOperationCopyWithImpl(
    super.value,
    super.then,
    super.then2,
  );

  @override
  late final ClassMapperBase<UpdatePaymentNumberOperation> $mapper =
      UpdatePaymentNumberOperationMapper.ensureInitialized();
  @override
  $R call({String? phoneNumber}) => $apply(
    FieldCopyWithData({if (phoneNumber != null) #phoneNumber: phoneNumber}),
  );
  @override
  UpdatePaymentNumberOperation $make(CopyWithData data) =>
      UpdatePaymentNumberOperation(
        phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
      );

  @override
  UpdatePaymentNumberOperationCopyWith<$R2, UpdatePaymentNumberOperation, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _UpdatePaymentNumberOperationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

class UpdateContactNumberOperationMapper
    extends ClassMapperBase<UpdateContactNumberOperation> {
  UpdateContactNumberOperationMapper._();

  static UpdateContactNumberOperationMapper? _instance;
  static UpdateContactNumberOperationMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = UpdateContactNumberOperationMapper._(),
      );
      QueuedOperationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'UpdateContactNumberOperation';

  static String _$phoneNumber(UpdateContactNumberOperation v) => v.phoneNumber;
  static const Field<UpdateContactNumberOperation, String> _f$phoneNumber =
      Field('phoneNumber', _$phoneNumber);
  static QueueOperationType _$type(UpdateContactNumberOperation v) => v.type;
  static const Field<UpdateContactNumberOperation, QueueOperationType> _f$type =
      Field('type', _$type, mode: FieldMode.member);

  @override
  final MappableFields<UpdateContactNumberOperation> fields = const {
    #phoneNumber: _f$phoneNumber,
    #type: _f$type,
  };

  static UpdateContactNumberOperation _instantiate(DecodingData data) {
    return UpdateContactNumberOperation(phoneNumber: data.dec(_f$phoneNumber));
  }

  @override
  final Function instantiate = _instantiate;

  static UpdateContactNumberOperation fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<UpdateContactNumberOperation>(map);
  }

  static UpdateContactNumberOperation fromJson(String json) {
    return ensureInitialized().decodeJson<UpdateContactNumberOperation>(json);
  }
}

mixin UpdateContactNumberOperationMappable {
  String toJson() {
    return UpdateContactNumberOperationMapper.ensureInitialized()
        .encodeJson<UpdateContactNumberOperation>(
          this as UpdateContactNumberOperation,
        );
  }

  Map<String, dynamic> toMap() {
    return UpdateContactNumberOperationMapper.ensureInitialized()
        .encodeMap<UpdateContactNumberOperation>(
          this as UpdateContactNumberOperation,
        );
  }

  UpdateContactNumberOperationCopyWith<
    UpdateContactNumberOperation,
    UpdateContactNumberOperation,
    UpdateContactNumberOperation
  >
  get copyWith =>
      _UpdateContactNumberOperationCopyWithImpl<
        UpdateContactNumberOperation,
        UpdateContactNumberOperation
      >(this as UpdateContactNumberOperation, $identity, $identity);
  @override
  String toString() {
    return UpdateContactNumberOperationMapper.ensureInitialized()
        .stringifyValue(this as UpdateContactNumberOperation);
  }

  @override
  bool operator ==(Object other) {
    return UpdateContactNumberOperationMapper.ensureInitialized().equalsValue(
      this as UpdateContactNumberOperation,
      other,
    );
  }

  @override
  int get hashCode {
    return UpdateContactNumberOperationMapper.ensureInitialized().hashValue(
      this as UpdateContactNumberOperation,
    );
  }
}

extension UpdateContactNumberOperationValueCopy<$R, $Out>
    on ObjectCopyWith<$R, UpdateContactNumberOperation, $Out> {
  UpdateContactNumberOperationCopyWith<$R, UpdateContactNumberOperation, $Out>
  get $asUpdateContactNumberOperation => $base.as(
    (v, t, t2) => _UpdateContactNumberOperationCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class UpdateContactNumberOperationCopyWith<
  $R,
  $In extends UpdateContactNumberOperation,
  $Out
>
    implements QueuedOperationCopyWith<$R, $In, $Out> {
  @override
  $R call({String? phoneNumber});
  UpdateContactNumberOperationCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _UpdateContactNumberOperationCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, UpdateContactNumberOperation, $Out>
    implements
        UpdateContactNumberOperationCopyWith<
          $R,
          UpdateContactNumberOperation,
          $Out
        > {
  _UpdateContactNumberOperationCopyWithImpl(
    super.value,
    super.then,
    super.then2,
  );

  @override
  late final ClassMapperBase<UpdateContactNumberOperation> $mapper =
      UpdateContactNumberOperationMapper.ensureInitialized();
  @override
  $R call({String? phoneNumber}) => $apply(
    FieldCopyWithData({if (phoneNumber != null) #phoneNumber: phoneNumber}),
  );
  @override
  UpdateContactNumberOperation $make(CopyWithData data) =>
      UpdateContactNumberOperation(
        phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
      );

  @override
  UpdateContactNumberOperationCopyWith<$R2, UpdateContactNumberOperation, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _UpdateContactNumberOperationCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

