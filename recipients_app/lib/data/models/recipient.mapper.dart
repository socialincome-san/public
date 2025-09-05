// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'recipient.dart';

class RecipientMapper extends ClassMapperBase<Recipient> {
  RecipientMapper._();

  static RecipientMapper? _instance;
  static RecipientMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = RecipientMapper._());
      LocalPartnerMapper.ensureInitialized();
      RecipientStatusMapper.ensureInitialized();
      ProgramMapper.ensureInitialized();
      UserMapper.ensureInitialized();
      PayoutMapper.ensureInitialized();
      SurveyMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Recipient';

  static String _$id(Recipient v) => v.id;
  static const Field<Recipient, String> _f$id = Field('id', _$id);
  static String _$userId(Recipient v) => v.userId;
  static const Field<Recipient, String> _f$userId = Field('userId', _$userId);
  static String _$programId(Recipient v) => v.programId;
  static const Field<Recipient, String> _f$programId = Field(
    'programId',
    _$programId,
  );
  static String _$localPartnerId(Recipient v) => v.localPartnerId;
  static const Field<Recipient, String> _f$localPartnerId = Field(
    'localPartnerId',
    _$localPartnerId,
  );
  static LocalPartner _$localPartner(Recipient v) => v.localPartner;
  static const Field<Recipient, LocalPartner> _f$localPartner = Field(
    'localPartner',
    _$localPartner,
  );
  static DateTime? _$startDate(Recipient v) => v.startDate;
  static const Field<Recipient, DateTime> _f$startDate = Field(
    'startDate',
    _$startDate,
  );
  static RecipientStatus _$status(Recipient v) => v.status;
  static const Field<Recipient, RecipientStatus> _f$status = Field(
    'status',
    _$status,
  );
  static int? _$omUid(Recipient v) => v.omUid;
  static const Field<Recipient, int> _f$omUid = Field('omUid', _$omUid);
  static String? _$profession(Recipient v) => v.profession;
  static const Field<Recipient, String> _f$profession = Field(
    'profession',
    _$profession,
  );
  static String? _$callingName(Recipient v) => v.callingName;
  static const Field<Recipient, String> _f$callingName = Field(
    'callingName',
    _$callingName,
  );
  static Program _$program(Recipient v) => v.program;
  static const Field<Recipient, Program> _f$program = Field(
    'program',
    _$program,
  );
  static User _$user(Recipient v) => v.user;
  static const Field<Recipient, User> _f$user = Field('user', _$user);
  static List<Payout> _$payouts(Recipient v) => v.payouts;
  static const Field<Recipient, List<Payout>> _f$payouts = Field(
    'payouts',
    _$payouts,
  );
  static List<Survey> _$surveys(Recipient v) => v.surveys;
  static const Field<Recipient, List<Survey>> _f$surveys = Field(
    'surveys',
    _$surveys,
  );

  @override
  final MappableFields<Recipient> fields = const {
    #id: _f$id,
    #userId: _f$userId,
    #programId: _f$programId,
    #localPartnerId: _f$localPartnerId,
    #localPartner: _f$localPartner,
    #startDate: _f$startDate,
    #status: _f$status,
    #omUid: _f$omUid,
    #profession: _f$profession,
    #callingName: _f$callingName,
    #program: _f$program,
    #user: _f$user,
    #payouts: _f$payouts,
    #surveys: _f$surveys,
  };

  static Recipient _instantiate(DecodingData data) {
    return Recipient(
      id: data.dec(_f$id),
      userId: data.dec(_f$userId),
      programId: data.dec(_f$programId),
      localPartnerId: data.dec(_f$localPartnerId),
      localPartner: data.dec(_f$localPartner),
      startDate: data.dec(_f$startDate),
      status: data.dec(_f$status),
      omUid: data.dec(_f$omUid),
      profession: data.dec(_f$profession),
      callingName: data.dec(_f$callingName),
      program: data.dec(_f$program),
      user: data.dec(_f$user),
      payouts: data.dec(_f$payouts),
      surveys: data.dec(_f$surveys),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Recipient fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Recipient>(map);
  }

  static Recipient fromJson(String json) {
    return ensureInitialized().decodeJson<Recipient>(json);
  }
}

mixin RecipientMappable {
  String toJson() {
    return RecipientMapper.ensureInitialized().encodeJson<Recipient>(
      this as Recipient,
    );
  }

  Map<String, dynamic> toMap() {
    return RecipientMapper.ensureInitialized().encodeMap<Recipient>(
      this as Recipient,
    );
  }

  RecipientCopyWith<Recipient, Recipient, Recipient> get copyWith =>
      _RecipientCopyWithImpl<Recipient, Recipient>(
        this as Recipient,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return RecipientMapper.ensureInitialized().stringifyValue(
      this as Recipient,
    );
  }

  @override
  bool operator ==(Object other) {
    return RecipientMapper.ensureInitialized().equalsValue(
      this as Recipient,
      other,
    );
  }

  @override
  int get hashCode {
    return RecipientMapper.ensureInitialized().hashValue(this as Recipient);
  }
}

extension RecipientValueCopy<$R, $Out> on ObjectCopyWith<$R, Recipient, $Out> {
  RecipientCopyWith<$R, Recipient, $Out> get $asRecipient =>
      $base.as((v, t, t2) => _RecipientCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class RecipientCopyWith<$R, $In extends Recipient, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner> get localPartner;
  ProgramCopyWith<$R, Program, Program> get program;
  UserCopyWith<$R, User, User> get user;
  ListCopyWith<$R, Payout, PayoutCopyWith<$R, Payout, Payout>> get payouts;
  ListCopyWith<$R, Survey, SurveyCopyWith<$R, Survey, Survey>> get surveys;
  $R call({
    String? id,
    String? userId,
    String? programId,
    String? localPartnerId,
    LocalPartner? localPartner,
    DateTime? startDate,
    RecipientStatus? status,
    int? omUid,
    String? profession,
    String? callingName,
    Program? program,
    User? user,
    List<Payout>? payouts,
    List<Survey>? surveys,
  });
  RecipientCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _RecipientCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Recipient, $Out>
    implements RecipientCopyWith<$R, Recipient, $Out> {
  _RecipientCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Recipient> $mapper =
      RecipientMapper.ensureInitialized();
  @override
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner> get localPartner =>
      $value.localPartner.copyWith.$chain((v) => call(localPartner: v));
  @override
  ProgramCopyWith<$R, Program, Program> get program =>
      $value.program.copyWith.$chain((v) => call(program: v));
  @override
  UserCopyWith<$R, User, User> get user =>
      $value.user.copyWith.$chain((v) => call(user: v));
  @override
  ListCopyWith<$R, Payout, PayoutCopyWith<$R, Payout, Payout>> get payouts =>
      ListCopyWith(
        $value.payouts,
        (v, t) => v.copyWith.$chain(t),
        (v) => call(payouts: v),
      );
  @override
  ListCopyWith<$R, Survey, SurveyCopyWith<$R, Survey, Survey>> get surveys =>
      ListCopyWith(
        $value.surveys,
        (v, t) => v.copyWith.$chain(t),
        (v) => call(surveys: v),
      );
  @override
  $R call({
    String? id,
    String? userId,
    String? programId,
    String? localPartnerId,
    LocalPartner? localPartner,
    Object? startDate = $none,
    RecipientStatus? status,
    Object? omUid = $none,
    Object? profession = $none,
    Object? callingName = $none,
    Program? program,
    User? user,
    List<Payout>? payouts,
    List<Survey>? surveys,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (userId != null) #userId: userId,
      if (programId != null) #programId: programId,
      if (localPartnerId != null) #localPartnerId: localPartnerId,
      if (localPartner != null) #localPartner: localPartner,
      if (startDate != $none) #startDate: startDate,
      if (status != null) #status: status,
      if (omUid != $none) #omUid: omUid,
      if (profession != $none) #profession: profession,
      if (callingName != $none) #callingName: callingName,
      if (program != null) #program: program,
      if (user != null) #user: user,
      if (payouts != null) #payouts: payouts,
      if (surveys != null) #surveys: surveys,
    }),
  );
  @override
  Recipient $make(CopyWithData data) => Recipient(
    id: data.get(#id, or: $value.id),
    userId: data.get(#userId, or: $value.userId),
    programId: data.get(#programId, or: $value.programId),
    localPartnerId: data.get(#localPartnerId, or: $value.localPartnerId),
    localPartner: data.get(#localPartner, or: $value.localPartner),
    startDate: data.get(#startDate, or: $value.startDate),
    status: data.get(#status, or: $value.status),
    omUid: data.get(#omUid, or: $value.omUid),
    profession: data.get(#profession, or: $value.profession),
    callingName: data.get(#callingName, or: $value.callingName),
    program: data.get(#program, or: $value.program),
    user: data.get(#user, or: $value.user),
    payouts: data.get(#payouts, or: $value.payouts),
    surveys: data.get(#surveys, or: $value.surveys),
  );

  @override
  RecipientCopyWith<$R2, Recipient, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _RecipientCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

