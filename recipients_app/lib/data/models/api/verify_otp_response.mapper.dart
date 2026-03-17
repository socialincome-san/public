// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'verify_otp_response.dart';

class VerifyOtpResponseMapper extends ClassMapperBase<VerifyOtpResponse> {
  VerifyOtpResponseMapper._();

  static VerifyOtpResponseMapper? _instance;
  static VerifyOtpResponseMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = VerifyOtpResponseMapper._());
    }
    return _instance!;
  }

  @override
  final String id = 'VerifyOtpResponse';

  static String _$customToken(VerifyOtpResponse v) => v.customToken;
  static const Field<VerifyOtpResponse, String> _f$customToken = Field(
    'customToken',
    _$customToken,
  );
  static bool _$isNewUser(VerifyOtpResponse v) => v.isNewUser;
  static const Field<VerifyOtpResponse, bool> _f$isNewUser = Field(
    'isNewUser',
    _$isNewUser,
  );
  static String _$uid(VerifyOtpResponse v) => v.uid;
  static const Field<VerifyOtpResponse, String> _f$uid = Field('uid', _$uid);

  @override
  final MappableFields<VerifyOtpResponse> fields = const {
    #customToken: _f$customToken,
    #isNewUser: _f$isNewUser,
    #uid: _f$uid,
  };

  static VerifyOtpResponse _instantiate(DecodingData data) {
    return VerifyOtpResponse(
      customToken: data.dec(_f$customToken),
      isNewUser: data.dec(_f$isNewUser),
      uid: data.dec(_f$uid),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static VerifyOtpResponse fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<VerifyOtpResponse>(map);
  }

  static VerifyOtpResponse fromJson(String json) {
    return ensureInitialized().decodeJson<VerifyOtpResponse>(json);
  }
}

mixin VerifyOtpResponseMappable {
  String toJson() {
    return VerifyOtpResponseMapper.ensureInitialized()
        .encodeJson<VerifyOtpResponse>(this as VerifyOtpResponse);
  }

  Map<String, dynamic> toMap() {
    return VerifyOtpResponseMapper.ensureInitialized()
        .encodeMap<VerifyOtpResponse>(this as VerifyOtpResponse);
  }

  VerifyOtpResponseCopyWith<
    VerifyOtpResponse,
    VerifyOtpResponse,
    VerifyOtpResponse
  >
  get copyWith =>
      _VerifyOtpResponseCopyWithImpl<VerifyOtpResponse, VerifyOtpResponse>(
        this as VerifyOtpResponse,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return VerifyOtpResponseMapper.ensureInitialized().stringifyValue(
      this as VerifyOtpResponse,
    );
  }

  @override
  bool operator ==(Object other) {
    return VerifyOtpResponseMapper.ensureInitialized().equalsValue(
      this as VerifyOtpResponse,
      other,
    );
  }

  @override
  int get hashCode {
    return VerifyOtpResponseMapper.ensureInitialized().hashValue(
      this as VerifyOtpResponse,
    );
  }
}

extension VerifyOtpResponseValueCopy<$R, $Out>
    on ObjectCopyWith<$R, VerifyOtpResponse, $Out> {
  VerifyOtpResponseCopyWith<$R, VerifyOtpResponse, $Out>
  get $asVerifyOtpResponse => $base.as(
    (v, t, t2) => _VerifyOtpResponseCopyWithImpl<$R, $Out>(v, t, t2),
  );
}

abstract class VerifyOtpResponseCopyWith<
  $R,
  $In extends VerifyOtpResponse,
  $Out
>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({String? customToken, bool? isNewUser, String? uid});
  VerifyOtpResponseCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  );
}

class _VerifyOtpResponseCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, VerifyOtpResponse, $Out>
    implements VerifyOtpResponseCopyWith<$R, VerifyOtpResponse, $Out> {
  _VerifyOtpResponseCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<VerifyOtpResponse> $mapper =
      VerifyOtpResponseMapper.ensureInitialized();
  @override
  $R call({String? customToken, bool? isNewUser, String? uid}) => $apply(
    FieldCopyWithData({
      if (customToken != null) #customToken: customToken,
      if (isNewUser != null) #isNewUser: isNewUser,
      if (uid != null) #uid: uid,
    }),
  );
  @override
  VerifyOtpResponse $make(CopyWithData data) => VerifyOtpResponse(
    customToken: data.get(#customToken, or: $value.customToken),
    isNewUser: data.get(#isNewUser, or: $value.isNewUser),
    uid: data.get(#uid, or: $value.uid),
  );

  @override
  VerifyOtpResponseCopyWith<$R2, VerifyOtpResponse, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _VerifyOtpResponseCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

