// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'signup_cubit.dart';

class SignupStatusMapper extends EnumMapper<SignupStatus> {
  SignupStatusMapper._();

  static SignupStatusMapper? _instance;
  static SignupStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SignupStatusMapper._());
    }
    return _instance!;
  }

  static SignupStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  SignupStatus decode(dynamic value) {
    switch (value) {
      case r'loadingPhoneNumber':
        return SignupStatus.loadingPhoneNumber;
      case r'loadingVerificationCode':
        return SignupStatus.loadingVerificationCode;
      case r'phoneNumberFailure':
        return SignupStatus.phoneNumberFailure;
      case r'enterPhoneNumber':
        return SignupStatus.enterPhoneNumber;
      case r'enterVerificationCode':
        return SignupStatus.enterVerificationCode;
      case r'verificationSuccess':
        return SignupStatus.verificationSuccess;
      case r'verificationFailure':
        return SignupStatus.verificationFailure;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(SignupStatus self) {
    switch (self) {
      case SignupStatus.loadingPhoneNumber:
        return r'loadingPhoneNumber';
      case SignupStatus.loadingVerificationCode:
        return r'loadingVerificationCode';
      case SignupStatus.phoneNumberFailure:
        return r'phoneNumberFailure';
      case SignupStatus.enterPhoneNumber:
        return r'enterPhoneNumber';
      case SignupStatus.enterVerificationCode:
        return r'enterVerificationCode';
      case SignupStatus.verificationSuccess:
        return r'verificationSuccess';
      case SignupStatus.verificationFailure:
        return r'verificationFailure';
    }
  }
}

extension SignupStatusMapperExtension on SignupStatus {
  String toValue() {
    SignupStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<SignupStatus>(this) as String;
  }
}

class SignupStateMapper extends ClassMapperBase<SignupState> {
  SignupStateMapper._();

  static SignupStateMapper? _instance;
  static SignupStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = SignupStateMapper._());
      SignupStatusMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'SignupState';

  static SignupStatus _$status(SignupState v) => v.status;
  static const Field<SignupState, SignupStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: SignupStatus.enterPhoneNumber,
  );
  static String? _$phoneNumber(SignupState v) => v.phoneNumber;
  static const Field<SignupState, String> _f$phoneNumber = Field(
    'phoneNumber',
    _$phoneNumber,
    opt: true,
  );
  static String? _$verificationId(SignupState v) => v.verificationId;
  static const Field<SignupState, String> _f$verificationId = Field(
    'verificationId',
    _$verificationId,
    opt: true,
  );
  static int? _$forceResendingToken(SignupState v) => v.forceResendingToken;
  static const Field<SignupState, int> _f$forceResendingToken = Field(
    'forceResendingToken',
    _$forceResendingToken,
    opt: true,
  );
  static Exception? _$exception(SignupState v) => v.exception;
  static const Field<SignupState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<SignupState> fields = const {
    #status: _f$status,
    #phoneNumber: _f$phoneNumber,
    #verificationId: _f$verificationId,
    #forceResendingToken: _f$forceResendingToken,
    #exception: _f$exception,
  };

  static SignupState _instantiate(DecodingData data) {
    return SignupState(
      status: data.dec(_f$status),
      phoneNumber: data.dec(_f$phoneNumber),
      verificationId: data.dec(_f$verificationId),
      forceResendingToken: data.dec(_f$forceResendingToken),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static SignupState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<SignupState>(map);
  }

  static SignupState fromJson(String json) {
    return ensureInitialized().decodeJson<SignupState>(json);
  }
}

mixin SignupStateMappable {
  String toJson() {
    return SignupStateMapper.ensureInitialized().encodeJson<SignupState>(
      this as SignupState,
    );
  }

  Map<String, dynamic> toMap() {
    return SignupStateMapper.ensureInitialized().encodeMap<SignupState>(
      this as SignupState,
    );
  }

  SignupStateCopyWith<SignupState, SignupState, SignupState> get copyWith =>
      _SignupStateCopyWithImpl<SignupState, SignupState>(
        this as SignupState,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return SignupStateMapper.ensureInitialized().stringifyValue(
      this as SignupState,
    );
  }

  @override
  bool operator ==(Object other) {
    return SignupStateMapper.ensureInitialized().equalsValue(
      this as SignupState,
      other,
    );
  }

  @override
  int get hashCode {
    return SignupStateMapper.ensureInitialized().hashValue(this as SignupState);
  }
}

extension SignupStateValueCopy<$R, $Out>
    on ObjectCopyWith<$R, SignupState, $Out> {
  SignupStateCopyWith<$R, SignupState, $Out> get $asSignupState =>
      $base.as((v, t, t2) => _SignupStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class SignupStateCopyWith<$R, $In extends SignupState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  $R call({
    SignupStatus? status,
    String? phoneNumber,
    String? verificationId,
    int? forceResendingToken,
    Exception? exception,
  });
  SignupStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _SignupStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, SignupState, $Out>
    implements SignupStateCopyWith<$R, SignupState, $Out> {
  _SignupStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<SignupState> $mapper =
      SignupStateMapper.ensureInitialized();
  @override
  $R call({
    SignupStatus? status,
    Object? phoneNumber = $none,
    Object? verificationId = $none,
    Object? forceResendingToken = $none,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (phoneNumber != $none) #phoneNumber: phoneNumber,
      if (verificationId != $none) #verificationId: verificationId,
      if (forceResendingToken != $none)
        #forceResendingToken: forceResendingToken,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  SignupState $make(CopyWithData data) => SignupState(
    status: data.get(#status, or: $value.status),
    phoneNumber: data.get(#phoneNumber, or: $value.phoneNumber),
    verificationId: data.get(#verificationId, or: $value.verificationId),
    forceResendingToken: data.get(
      #forceResendingToken,
      or: $value.forceResendingToken,
    ),
    exception: data.get(#exception, or: $value.exception),
  );

  @override
  SignupStateCopyWith<$R2, SignupState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _SignupStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

