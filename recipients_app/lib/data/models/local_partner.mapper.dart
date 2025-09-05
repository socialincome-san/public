// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'local_partner.dart';

class LocalPartnerMapper extends ClassMapperBase<LocalPartner> {
  LocalPartnerMapper._();

  static LocalPartnerMapper? _instance;
  static LocalPartnerMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = LocalPartnerMapper._());
      UserMapper.ensureInitialized();
      RecipientMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'LocalPartner';

  static String _$id(LocalPartner v) => v.id;
  static const Field<LocalPartner, String> _f$id = Field('id', _$id);
  static String _$name(LocalPartner v) => v.name;
  static const Field<LocalPartner, String> _f$name = Field('name', _$name);
  static String _$userId(LocalPartner v) => v.userId;
  static const Field<LocalPartner, String> _f$userId = Field(
    'userId',
    _$userId,
  );
  static DateTime _$createdAt(LocalPartner v) => v.createdAt;
  static const Field<LocalPartner, DateTime> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static DateTime? _$updatedAt(LocalPartner v) => v.updatedAt;
  static const Field<LocalPartner, DateTime> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
  );
  static User _$user(LocalPartner v) => v.user;
  static const Field<LocalPartner, User> _f$user = Field('user', _$user);
  static List<Recipient> _$recipients(LocalPartner v) => v.recipients;
  static const Field<LocalPartner, List<Recipient>> _f$recipients = Field(
    'recipients',
    _$recipients,
  );

  @override
  final MappableFields<LocalPartner> fields = const {
    #id: _f$id,
    #name: _f$name,
    #userId: _f$userId,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
    #user: _f$user,
    #recipients: _f$recipients,
  };

  static LocalPartner _instantiate(DecodingData data) {
    return LocalPartner(
      id: data.dec(_f$id),
      name: data.dec(_f$name),
      userId: data.dec(_f$userId),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
      user: data.dec(_f$user),
      recipients: data.dec(_f$recipients),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static LocalPartner fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<LocalPartner>(map);
  }

  static LocalPartner fromJson(String json) {
    return ensureInitialized().decodeJson<LocalPartner>(json);
  }
}

mixin LocalPartnerMappable {
  String toJson() {
    return LocalPartnerMapper.ensureInitialized().encodeJson<LocalPartner>(
      this as LocalPartner,
    );
  }

  Map<String, dynamic> toMap() {
    return LocalPartnerMapper.ensureInitialized().encodeMap<LocalPartner>(
      this as LocalPartner,
    );
  }

  LocalPartnerCopyWith<LocalPartner, LocalPartner, LocalPartner> get copyWith =>
      _LocalPartnerCopyWithImpl<LocalPartner, LocalPartner>(
        this as LocalPartner,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return LocalPartnerMapper.ensureInitialized().stringifyValue(
      this as LocalPartner,
    );
  }

  @override
  bool operator ==(Object other) {
    return LocalPartnerMapper.ensureInitialized().equalsValue(
      this as LocalPartner,
      other,
    );
  }

  @override
  int get hashCode {
    return LocalPartnerMapper.ensureInitialized().hashValue(
      this as LocalPartner,
    );
  }
}

extension LocalPartnerValueCopy<$R, $Out>
    on ObjectCopyWith<$R, LocalPartner, $Out> {
  LocalPartnerCopyWith<$R, LocalPartner, $Out> get $asLocalPartner =>
      $base.as((v, t, t2) => _LocalPartnerCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class LocalPartnerCopyWith<$R, $In extends LocalPartner, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  UserCopyWith<$R, User, User> get user;
  ListCopyWith<$R, Recipient, RecipientCopyWith<$R, Recipient, Recipient>>
  get recipients;
  $R call({
    String? id,
    String? name,
    String? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    User? user,
    List<Recipient>? recipients,
  });
  LocalPartnerCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _LocalPartnerCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, LocalPartner, $Out>
    implements LocalPartnerCopyWith<$R, LocalPartner, $Out> {
  _LocalPartnerCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<LocalPartner> $mapper =
      LocalPartnerMapper.ensureInitialized();
  @override
  UserCopyWith<$R, User, User> get user =>
      $value.user.copyWith.$chain((v) => call(user: v));
  @override
  ListCopyWith<$R, Recipient, RecipientCopyWith<$R, Recipient, Recipient>>
  get recipients => ListCopyWith(
    $value.recipients,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(recipients: v),
  );
  @override
  $R call({
    String? id,
    String? name,
    String? userId,
    DateTime? createdAt,
    Object? updatedAt = $none,
    User? user,
    List<Recipient>? recipients,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (name != null) #name: name,
      if (userId != null) #userId: userId,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
      if (user != null) #user: user,
      if (recipients != null) #recipients: recipients,
    }),
  );
  @override
  LocalPartner $make(CopyWithData data) => LocalPartner(
    id: data.get(#id, or: $value.id),
    name: data.get(#name, or: $value.name),
    userId: data.get(#userId, or: $value.userId),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
    user: data.get(#user, or: $value.user),
    recipients: data.get(#recipients, or: $value.recipients),
  );

  @override
  LocalPartnerCopyWith<$R2, LocalPartner, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _LocalPartnerCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

