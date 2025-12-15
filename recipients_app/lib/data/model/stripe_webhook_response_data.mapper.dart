// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'stripe_webhook_response_data.dart';

class StripeWebhookResponseDataMapper
    extends ClassMapperBase<StripeWebhookResponseData> {
  StripeWebhookResponseDataMapper._();

  static StripeWebhookResponseDataMapper? _instance;
  static StripeWebhookResponseDataMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(
        _instance = StripeWebhookResponseDataMapper._(),
      );
    }
    return _instance!;
  }

  @override
  final String id = 'StripeWebhookResponseData';

  static String? _$contributionId(StripeWebhookResponseData v) =>
      v.contributionId;
  static const Field<StripeWebhookResponseData, String> _f$contributionId =
      Field('contributionId', _$contributionId, opt: true);
  static String? _$contributorId(StripeWebhookResponseData v) =>
      v.contributorId;
  static const Field<StripeWebhookResponseData, String> _f$contributorId =
      Field('contributorId', _$contributorId, opt: true);
  static bool? _$isNewContributor(StripeWebhookResponseData v) =>
      v.isNewContributor;
  static const Field<StripeWebhookResponseData, bool> _f$isNewContributor =
      Field('isNewContributor', _$isNewContributor, opt: true);

  @override
  final MappableFields<StripeWebhookResponseData> fields = const {
    #contributionId: _f$contributionId,
    #contributorId: _f$contributorId,
    #isNewContributor: _f$isNewContributor,
  };

  static StripeWebhookResponseData _instantiate(DecodingData data) {
    return StripeWebhookResponseData(
      contributionId: data.dec(_f$contributionId),
      contributorId: data.dec(_f$contributorId),
      isNewContributor: data.dec(_f$isNewContributor),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static StripeWebhookResponseData fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<StripeWebhookResponseData>(map);
  }

  static StripeWebhookResponseData fromJson(String json) {
    return ensureInitialized().decodeJson<StripeWebhookResponseData>(json);
  }
}

mixin StripeWebhookResponseDataMappable {
  String toJson() {
    return StripeWebhookResponseDataMapper.ensureInitialized()
        .encodeJson<StripeWebhookResponseData>(
          this as StripeWebhookResponseData,
        );
  }

  Map<String, dynamic> toMap() {
    return StripeWebhookResponseDataMapper.ensureInitialized()
        .encodeMap<StripeWebhookResponseData>(
          this as StripeWebhookResponseData,
        );
  }

  StripeWebhookResponseDataCopyWith<
    StripeWebhookResponseData,
    StripeWebhookResponseData,
    StripeWebhookResponseData
  >
  get copyWith =>
      _StripeWebhookResponseDataCopyWithImpl<
        StripeWebhookResponseData,
        StripeWebhookResponseData
      >(this as StripeWebhookResponseData, $identity, $identity);
  @override
  String toString() {
    return StripeWebhookResponseDataMapper.ensureInitialized().stringifyValue(
      this as StripeWebhookResponseData,
    );
  }

  @override
  bool operator ==(Object other) {
    return StripeWebhookResponseDataMapper.ensureInitialized().equalsValue(
      this as StripeWebhookResponseData,
      other,
    );
  }

  @override
  int get hashCode {
    return StripeWebhookResponseDataMapper.ensureInitialized().hashValue(
      this as StripeWebhookResponseData,
    );
  }
}

extension StripeWebhookResponseDataValueCopy<$R, $Out>
    on ObjectCopyWith<$R, StripeWebhookResponseData, $Out> {
  StripeWebhookResponseDataCopyWith<$R, StripeWebhookResponseData, $Out>
  get $asStripeWebhookResponseData => $base.as(
    (v, t, t2) => _StripeWebhookResponseDataCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class StripeWebhookResponseDataCopyWith<
  $R,
  $In extends StripeWebhookResponseData,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    String? contributionId,
    String? contributorId,
    bool? isNewContributor,
  });
  StripeWebhookResponseDataCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _StripeWebhookResponseDataCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, StripeWebhookResponseData, $Out>
    implements
        StripeWebhookResponseDataCopyWith<$R, StripeWebhookResponseData, $Out> {
  _StripeWebhookResponseDataCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<StripeWebhookResponseData> $mapper =
      StripeWebhookResponseDataMapper.ensureInitialized();
  @override
  $R call({
    Object? contributionId = $none,
    Object? contributorId = $none,
    Object? isNewContributor = $none,
  }) => $apply(
    FieldCopyWithData({
      if (contributionId != $none) #contributionId: contributionId,
      if (contributorId != $none) #contributorId: contributorId,
      if (isNewContributor != $none) #isNewContributor: isNewContributor,
    }),
  );
  @override
  StripeWebhookResponseData $make(CopyWithData data) =>
      StripeWebhookResponseData(
        contributionId: data.get(#contributionId, or: $value.contributionId),
        contributorId: data.get(#contributorId, or: $value.contributorId),
        isNewContributor: data.get(
          #isNewContributor,
          or: $value.isNewContributor,
        ),
      );

  @override
  StripeWebhookResponseDataCopyWith<$R2, StripeWebhookResponseData, $Out2>
  $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _StripeWebhookResponseDataCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

