// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'request_otp_request.dart';

class RequestOtpRequestMapper extends ClassMapperBase<RequestOtpRequest> {
  RequestOtpRequestMapper._();

  static RequestOtpRequestMapper? _instance;
  static RequestOtpRequestMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RequestOtpRequestMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'RequestOtpRequest';

  static String _$phoneNumber(RequestOtpRequest v) => v.phoneNumber;
  static const Field<RequestOtpRequest, String> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
  );

  @override
  final MappableFields<RequestOtpRequest> fields = const {
    #phoneNumber: _f$phoneNumber,
  };

  static RequestOtpRequest _instantiate(DecodingData data) {
    return RequestOtpRequest(phoneNumber: data.dec(_f$phoneNumber));
  }

  @override
  final Function instantiate = _instantiate;

  static RequestOtpRequest fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<RequestOtpRequest>(map);
  }

  static RequestOtpRequest fromJson(String json) {
    return ensureInitialized().decodeJson<RequestOtpRequest>(json);
  }
}

mixin RequestOtpRequestMappable {
  String toJson() {
    return RequestOtpRequestMapper.ensureInitialized()
        .encodeJson<RequestOtpRequest>(this as RequestOtpRequest);
  }

  Map<String, dynamic> toMap() {
    return RequestOtpRequestMapper.ensureInitialized()
        .encodeMap<RequestOtpRequest>(this as RequestOtpRequest);
  }

  RequestOtpRequestCopyWith<
    RequestOtpRequest,
    RequestOtpRequest,
    RequestOtpRequest
  >
  get copyWith =>
      _RequestOtpRequestCopyWithImpl<RequestOtpRequest, RequestOtpRequest>(
        this as RequestOtpRequest,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return RequestOtpRequestMapper.ensureInitialized().stringifyValue(
      this as RequestOtpRequest,
    );
  }

  @override
  bool operator ==(Object other) {
    return RequestOtpRequestMapper.ensureInitialized().equalsValue(
      this as RequestOtpRequest,
      other,
    );
  }

  @override
  int get hashCode {
    return RequestOtpRequestMapper.ensureInitialized().hashValue(
      this as RequestOtpRequest,
    );
  }
}

extension RequestOtpRequestValueCopy<$R, $Out>
    on ObjectCopyWith<$R, RequestOtpRequest, $Out> {
  RequestOtpRequestCopyWith<$R, RequestOtpRequest, $Out>
  get $asRequestOtpRequest => $base.as(
    (v, t, t2) => _RequestOtpRequestCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class RequestOtpRequestCopyWith<
  $R,
  $In extends RequestOtpRequest,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? phoneNumber});
  RequestOtpRequestCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _RequestOtpRequestCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, RequestOtpRequest, $Out>
    implements RequestOtpRequestCopyWith<$R, RequestOtpRequest, $Out> {
  _RequestOtpRequestCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<RequestOtpRequest> $mapper =
      RequestOtpRequestMapper.ensureInitialized();
  @override
  $R call({String? phoneNumber}) => $apply(
    FieldCopyWithData({if (phoneNumber != null) #phoneNumber: phoneNumber}),
  );
  @override
  RequestOtpRequest $make(CopyWithData data) => RequestOtpRequest(
    phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
  );

  @override
  RequestOtpRequestCopyWith<$R2, RequestOtpRequest, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _RequestOtpRequestCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

