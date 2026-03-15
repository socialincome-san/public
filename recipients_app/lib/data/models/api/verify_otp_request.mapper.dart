// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'verify_otp_request.dart';

class VerifyOtpRequestMapper extends ClassMapperBase<VerifyOtpRequest> {
  VerifyOtpRequestMapper._();

  static VerifyOtpRequestMapper? _instance;
  static VerifyOtpRequestMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = VerifyOtpRequestMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'VerifyOtpRequest';

  static String _$phoneNumber(VerifyOtpRequest v) => v.phoneNumber;
  static const Field<VerifyOtpRequest, String> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
  );
  static String _$otp(VerifyOtpRequest v) => v.otp;
  static const Field<VerifyOtpRequest, String> _f$otp = Field('otp', _$otp);

  @override
  final MappableFields<VerifyOtpRequest> fields = const {
    #phoneNumber: _f$phoneNumber,
    #otp: _f$otp,
  };

  static VerifyOtpRequest _instantiate(DecodingData data) {
    return VerifyOtpRequest(
      phoneNumber: data.dec(_f$phoneNumber),
      otp: data.dec(_f$otp),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static VerifyOtpRequest fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<VerifyOtpRequest>(map);
  }

  static VerifyOtpRequest fromJson(String json) {
    return ensureInitialized().decodeJson<VerifyOtpRequest>(json);
  }
}

mixin VerifyOtpRequestMappable {
  String toJson() {
    return VerifyOtpRequestMapper.ensureInitialized()
        .encodeJson<VerifyOtpRequest>(this as VerifyOtpRequest);
  }

  Map<String, dynamic> toMap() {
    return VerifyOtpRequestMapper.ensureInitialized()
        .encodeMap<VerifyOtpRequest>(this as VerifyOtpRequest);
  }

  VerifyOtpRequestCopyWith<VerifyOtpRequest, VerifyOtpRequest, VerifyOtpRequest>
  get copyWith =>
      _VerifyOtpRequestCopyWithImpl<VerifyOtpRequest, VerifyOtpRequest>(
        this as VerifyOtpRequest,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return VerifyOtpRequestMapper.ensureInitialized().stringifyValue(
      this as VerifyOtpRequest,
    );
  }

  @override
  bool operator ==(Object other) {
    return VerifyOtpRequestMapper.ensureInitialized().equalsValue(
      this as VerifyOtpRequest,
      other,
    );
  }

  @override
  int get hashCode {
    return VerifyOtpRequestMapper.ensureInitialized().hashValue(
      this as VerifyOtpRequest,
    );
  }
}

extension VerifyOtpRequestValueCopy<$R, $Out>
    on ObjectCopyWith<$R, VerifyOtpRequest, $Out> {
  VerifyOtpRequestCopyWith<$R, VerifyOtpRequest, $Out>
  get $asVerifyOtpRequest =>
      $base.as((v, t, t2) => _VerifyOtpRequestCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class VerifyOtpRequestCopyWith<$R, $In extends VerifyOtpRequest, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? phoneNumber, String? otp});
  VerifyOtpRequestCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _VerifyOtpRequestCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, VerifyOtpRequest, $Out>
    implements VerifyOtpRequestCopyWith<$R, VerifyOtpRequest, $Out> {
  _VerifyOtpRequestCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<VerifyOtpRequest> $mapper =
      VerifyOtpRequestMapper.ensureInitialized();
  @override
  $R call({String? phoneNumber, String? otp}) => $apply(
    FieldCopyWithData({
      if (phoneNumber != null) #phoneNumber: phoneNumber,
      if (otp != null) #otp: otp,
    }),
  );
  @override
  VerifyOtpRequest $make(CopyWithData data) => VerifyOtpRequest(
    phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
    otp: data.get(#otp, or: $value.otp),
  );

  @override
  VerifyOtpRequestCopyWith<$R2, VerifyOtpRequest, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _VerifyOtpRequestCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

