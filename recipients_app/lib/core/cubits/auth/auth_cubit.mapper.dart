// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: invalid_use_of_protected_member
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'auth_cubit.dart';

class AuthStatusMapper extends EnumMapper<AuthStatus> {
  AuthStatusMapper._();

  static AuthStatusMapper? _instance;
  static AuthStatusMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = AuthStatusMapper._());
    }
    return _instance!;
  }

  static AuthStatus fromValue(dynamic value) {
    ensureInitialized();
    return MapperContainer.globals.fromValue(value);
  }

  @override
  AuthStatus decode(dynamic value) {
    switch (value) {
      case r'loading':
        return AuthStatus.loading;
      case r'unauthenticated':
        return AuthStatus.unauthenticated;
      case r'authenticated':
        return AuthStatus.authenticated;
      case r'updatingRecipient':
        return AuthStatus.updatingRecipient;
      case r'updateRecipientSuccess':
        return AuthStatus.updateRecipientSuccess;
      case r'updateRecipientFailure':
        return AuthStatus.updateRecipientFailure;
      case r'failure':
        return AuthStatus.failure;
      default:
        throw MapperException.unknownEnumValue(value);
    }
  }

  @override
  dynamic encode(AuthStatus self) {
    switch (self) {
      case AuthStatus.loading:
        return r'loading';
      case AuthStatus.unauthenticated:
        return r'unauthenticated';
      case AuthStatus.authenticated:
        return r'authenticated';
      case AuthStatus.updatingRecipient:
        return r'updatingRecipient';
      case AuthStatus.updateRecipientSuccess:
        return r'updateRecipientSuccess';
      case AuthStatus.updateRecipientFailure:
        return r'updateRecipientFailure';
      case AuthStatus.failure:
        return r'failure';
    }
  }
}

extension AuthStatusMapperExtension on AuthStatus {
  String toValue() {
    AuthStatusMapper.ensureInitialized();
    return MapperContainer.globals.toValue<AuthStatus>(this) as String;
  }
}

class AuthStateMapper extends ClassMapperBase<AuthState> {
  AuthStateMapper._();

  static AuthStateMapper? _instance;
  static AuthStateMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = AuthStateMapper._());
      AuthStatusMapper.ensureInitialized();
      RecipientMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'AuthState';

  static AuthStatus _$status(AuthState v) => v.status;
  static const Field<AuthState, AuthStatus> _f$status = Field(
    'status',
    _$status,
    opt: true,
    def: AuthStatus.unauthenticated,
  );
  static User? _$firebaseUser(AuthState v) => v.firebaseUser;
  static const Field<AuthState, User> _f$firebaseUser = Field(
    'firebaseUser',
    _$firebaseUser,
    opt: true,
  );
  static Recipient? _$recipient(AuthState v) => v.recipient;
  static const Field<AuthState, Recipient> _f$recipient = Field(
    'recipient',
    _$recipient,
    opt: true,
  );
  static Exception? _$exception(AuthState v) => v.exception;
  static const Field<AuthState, Exception> _f$exception = Field(
    'exception',
    _$exception,
    opt: true,
  );

  @override
  final MappableFields<AuthState> fields = const {
    #status: _f$status,
    #firebaseUser: _f$firebaseUser,
    #recipient: _f$recipient,
    #exception: _f$exception,
  };

  static AuthState _instantiate(DecodingData data) {
    return AuthState(
      status: data.dec(_f$status),
      firebaseUser: data.dec(_f$firebaseUser),
      recipient: data.dec(_f$recipient),
      exception: data.dec(_f$exception),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static AuthState fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<AuthState>(map);
  }

  static AuthState fromJson(String json) {
    return ensureInitialized().decodeJson<AuthState>(json);
  }
}

mixin AuthStateMappable {
  String toJson() {
    return AuthStateMapper.ensureInitialized().encodeJson<AuthState>(
      this as AuthState,
    );
  }

  Map<String, dynamic> toMap() {
    return AuthStateMapper.ensureInitialized().encodeMap<AuthState>(
      this as AuthState,
    );
  }

  AuthStateCopyWith<AuthState, AuthState, AuthState> get copyWith =>
      _AuthStateCopyWithImpl<AuthState, AuthState>(
        this as AuthState,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return AuthStateMapper.ensureInitialized().stringifyValue(
      this as AuthState,
    );
  }

  @override
  bool operator ==(Object other) {
    return AuthStateMapper.ensureInitialized().equalsValue(
      this as AuthState,
      other,
    );
  }

  @override
  int get hashCode {
    return AuthStateMapper.ensureInitialized().hashValue(this as AuthState);
  }
}

extension AuthStateValueCopy<$R, $Out> on ObjectCopyWith<$R, AuthState, $Out> {
  AuthStateCopyWith<$R, AuthState, $Out> get $asAuthState =>
      $base.as((v, t, t2) => _AuthStateCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class AuthStateCopyWith<$R, $In extends AuthState, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  RecipientCopyWith<$R, Recipient, Recipient>? get recipient;
  $R call({
    AuthStatus? status,
    User? firebaseUser,
    Recipient? recipient,
    Exception? exception,
  });
  AuthStateCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _AuthStateCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, AuthState, $Out>
    implements AuthStateCopyWith<$R, AuthState, $Out> {
  _AuthStateCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<AuthState> $mapper =
      AuthStateMapper.ensureInitialized();
  @override
  RecipientCopyWith<$R, Recipient, Recipient>? get recipient =>
      $value.recipient?.copyWith.$chain((v) => call(recipient: v));
  @override
  $R call({
    AuthStatus? status,
    Object? firebaseUser = $none,
    Object? recipient = $none,
    Object? exception = $none,
  }) => $apply(
    FieldCopyWithData({
      if (status != null) #status: status,
      if (firebaseUser != $none) #firebaseUser: firebaseUser,
      if (recipient != $none) #recipient: recipient,
      if (exception != $none) #exception: exception,
    }),
  );
  @override
  AuthState $make(CopyWithData data) => AuthState(
    status: data.get(#status, or: $value.status),
    firebaseUser: data.get(#firebaseUser, or: $value.firebaseUser),
    recipient: data.get(#recipient, or: $value.recipient),
    exception: data.get(#exception, or: $value.exception),
  );

  @override
  AuthStateCopyWith<$R2, AuthState, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _AuthStateCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

