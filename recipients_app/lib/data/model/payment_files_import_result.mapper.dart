// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'payment_files_import_result.dart';

class PaymentFilesImportResultMapper
    extends ClassMapperBase<PaymentFilesImportResult> {
  PaymentFilesImportResultMapper._();

  static PaymentFilesImportResultMapper? _instance;
  static PaymentFilesImportResultMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = PaymentFilesImportResultMapper._(),
      );
    }
    return _instance!;
  }

  @override
  final String id = 'PaymentFilesImportResult';

  static String _$id(PaymentFilesImportResult v) => v.id;
  static const Field<PaymentFilesImportResult, String> _f$id = Field(
    'id',
    _$id,
  );
  static String _$contributionId(PaymentFilesImportResult v) =>
      v.contributionId;
  static const Field<PaymentFilesImportResult, String> _f$contributionId =
      Field('contributionId', _$contributionId);
  static String _$type(PaymentFilesImportResult v) => v.type;
  static const Field<PaymentFilesImportResult, String> _f$type = Field(
    'type',
    _$type,
  );
  static String _$transactionId(PaymentFilesImportResult v) => v.transactionId;
  static const Field<PaymentFilesImportResult, String> _f$transactionId = Field(
    'transactionId',
    _$transactionId,
  );
  static String? _$metadata(PaymentFilesImportResult v) => v.metadata;
  static const Field<PaymentFilesImportResult, String> _f$metadata = Field(
    'metadata',
    _$metadata,
    opt: true,
  );
  static DateTime _$createdAt(PaymentFilesImportResult v) => v.createdAt;
  static const Field<PaymentFilesImportResult, DateTime> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static DateTime? _$updatedAt(PaymentFilesImportResult v) => v.updatedAt;
  static const Field<PaymentFilesImportResult, DateTime> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<PaymentFilesImportResult> fields = const {
    #id: _f$id,
    #contributionId: _f$contributionId,
    #type: _f$type,
    #transactionId: _f$transactionId,
    #metadata: _f$metadata,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static PaymentFilesImportResult _instantiate(DecodingData data) {
    return PaymentFilesImportResult(
      id: data.dec(_f$id),
      contributionId: data.dec(_f$contributionId),
      type: data.dec(_f$type),
      transactionId: data.dec(_f$transactionId),
      metadata: data.dec(_f$metadata),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static PaymentFilesImportResult fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<PaymentFilesImportResult>(map);
  }

  static PaymentFilesImportResult fromJson(String json) {
    return ensureInitialized().decodeJson<PaymentFilesImportResult>(json);
  }
}

mixin PaymentFilesImportResultMappable {
  String toJson() {
    return PaymentFilesImportResultMapper.ensureInitialized()
        .encodeJson<PaymentFilesImportResult>(this as PaymentFilesImportResult);
  }

  Map<String, dynamic> toMap() {
    return PaymentFilesImportResultMapper.ensureInitialized()
        .encodeMap<PaymentFilesImportResult>(this as PaymentFilesImportResult);
  }

  PaymentFilesImportResultCopyWith<
    PaymentFilesImportResult,
    PaymentFilesImportResult,
    PaymentFilesImportResult
  >
  get copyWith =>
      _PaymentFilesImportResultCopyWithImpl<
        PaymentFilesImportResult,
        PaymentFilesImportResult
      >(this as PaymentFilesImportResult, $identity, $identity);
  @override
  String toString() {
    return PaymentFilesImportResultMapper.ensureInitialized().stringifyValue(
      this as PaymentFilesImportResult,
    );
  }

  @override
  bool operator ==(Object other) {
    return PaymentFilesImportResultMapper.ensureInitialized().equalsValue(
      this as PaymentFilesImportResult,
      other,
    );
  }

  @override
  int get hashCode {
    return PaymentFilesImportResultMapper.ensureInitialized().hashValue(
      this as PaymentFilesImportResult,
    );
  }
}

extension PaymentFilesImportResultValueCopy<$R, $Out>
    on ObjectCopyWith<$R, PaymentFilesImportResult, $Out> {
  PaymentFilesImportResultCopyWith<$R, PaymentFilesImportResult, $Out>
  get $asPaymentFilesImportResult => $base.as(
    (v, t, t2) => _PaymentFilesImportResultCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class PaymentFilesImportResultCopyWith<
  $R,
  $In extends PaymentFilesImportResult,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? id,
    String? contributionId,
    String? type,
    String? transactionId,
    String? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
  PaymentFilesImportResultCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _PaymentFilesImportResultCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, PaymentFilesImportResult, $Out>
    implements
        PaymentFilesImportResultCopyWith<$R, PaymentFilesImportResult, $Out> {
  _PaymentFilesImportResultCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<PaymentFilesImportResult> $mapper =
      PaymentFilesImportResultMapper.ensureInitialized();
  @override
  $R call({
    String? id,
    String? contributionId,
    String? type,
    String? transactionId,
    Object? metadata = $none,
    DateTime? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (contributionId != null) #contributionId: contributionId,
      if (type != null) #type: type,
      if (transactionId != null) #transactionId: transactionId,
      if (metadata != $none) #metadata: metadata,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  PaymentFilesImportResult $make(CopyWithData data) => PaymentFilesImportResult(
    id: data.get(#id, or: $value.id),
    contributionId: data.get(#contributionId, or: $value.contributionId),
    type: data.get(#type, or: $value.type),
    transactionId: data.get(#transactionId, or: $value.transactionId),
    metadata: data.get(#metadata, or: $value.metadata),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  PaymentFilesImportResultCopyWith<$R2, PaymentFilesImportResult, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _PaymentFilesImportResultCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

