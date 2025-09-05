// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
// ignore_for_file: type=lint
// ignore_for_file: unused_element, unnecessary_cast, override_on_non_overriding_member
// ignore_for_file: strict_raw_type, inference_failure_on_untyped_parameter

part of 'program.dart';

class ProgramMapper extends ClassMapperBase<Program> {
  ProgramMapper._();

  static ProgramMapper? _instance;
  static ProgramMapper ensureInitialized() {
    if (_instance == null) {
      MapperContainer.globals.use(_instance = ProgramMapper._());
      CurrencyMapper.ensureInitialized();
      PayoutIntervalMapper.ensureInitialized();
      OrganizationMapper.ensureInitialized();
      RecipientMapper.ensureInitialized();
      SurveyMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Program';

  static String _$id(Program v) => v.id;
  static const Field<Program, String> _f$id = Field('id', _$id);
  static String _$name(Program v) => v.name;
  static const Field<Program, String> _f$name = Field('name', _$name);
  static int _$totalPayments(Program v) => v.totalPayments;
  static const Field<Program, int> _f$totalPayments = Field(
    'totalPayments',
    _$totalPayments,
  );
  static double _$payoutAmount(Program v) => v.payoutAmount;
  static const Field<Program, double> _f$payoutAmount = Field(
    'payoutAmount',
    _$payoutAmount,
  );
  static Currency _$payoutCurrency(Program v) => v.payoutCurrency;
  static const Field<Program, Currency> _f$payoutCurrency = Field(
    'payoutCurrency',
    _$payoutCurrency,
  );
  static PayoutInterval _$payoutInterval(Program v) => v.payoutInterval;
  static const Field<Program, PayoutInterval> _f$payoutInterval = Field(
    'payoutInterval',
    _$payoutInterval,
  );
  static String _$country(Program v) => v.country;
  static const Field<Program, String> _f$country = Field('country', _$country);
  static String _$viewerOrganizationId(Program v) => v.viewerOrganizationId;
  static const Field<Program, String> _f$viewerOrganizationId = Field(
    'viewerOrganizationId',
    _$viewerOrganizationId,
  );
  static String _$operatorOrganizationId(Program v) => v.operatorOrganizationId;
  static const Field<Program, String> _f$operatorOrganizationId = Field(
    'operatorOrganizationId',
    _$operatorOrganizationId,
  );
  static Organization _$owner(Program v) => v.owner;
  static const Field<Program, Organization> _f$owner = Field('owner', _$owner);
  static Organization _$operator(Program v) => v.operator;
  static const Field<Program, Organization> _f$operator = Field(
    'operator',
    _$operator,
  );
  static List<Recipient> _$recipients(Program v) => v.recipients;
  static const Field<Program, List<Recipient>> _f$recipients = Field(
    'recipients',
    _$recipients,
  );
  static List<Survey> _$surveys(Program v) => v.surveys;
  static const Field<Program, List<Survey>> _f$surveys = Field(
    'surveys',
    _$surveys,
  );
  static DateTime _$createdAt(Program v) => v.createdAt;
  static const Field<Program, DateTime> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static DateTime? _$updatedAt(Program v) => v.updatedAt;
  static const Field<Program, DateTime> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
  );

  @override
  final MappableFields<Program> fields = const {
    #id: _f$id,
    #name: _f$name,
    #totalPayments: _f$totalPayments,
    #payoutAmount: _f$payoutAmount,
    #payoutCurrency: _f$payoutCurrency,
    #payoutInterval: _f$payoutInterval,
    #country: _f$country,
    #viewerOrganizationId: _f$viewerOrganizationId,
    #operatorOrganizationId: _f$operatorOrganizationId,
    #owner: _f$owner,
    #operator: _f$operator,
    #recipients: _f$recipients,
    #surveys: _f$surveys,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Program _instantiate(DecodingData data) {
    return Program(
      id: data.dec(_f$id),
      name: data.dec(_f$name),
      totalPayments: data.dec(_f$totalPayments),
      payoutAmount: data.dec(_f$payoutAmount),
      payoutCurrency: data.dec(_f$payoutCurrency),
      payoutInterval: data.dec(_f$payoutInterval),
      country: data.dec(_f$country),
      viewerOrganizationId: data.dec(_f$viewerOrganizationId),
      operatorOrganizationId: data.dec(_f$operatorOrganizationId),
      owner: data.dec(_f$owner),
      operator: data.dec(_f$operator),
      recipients: data.dec(_f$recipients),
      surveys: data.dec(_f$surveys),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
    );
  }

  @override
  final Function instantiate = _instantiate;

  static Program fromMap(Map<String, dynamic> map) {
    return ensureInitialized().decodeMap<Program>(map);
  }

  static Program fromJson(String json) {
    return ensureInitialized().decodeJson<Program>(json);
  }
}

mixin ProgramMappable {
  String toJson() {
    return ProgramMapper.ensureInitialized().encodeJson<Program>(
      this as Program,
    );
  }

  Map<String, dynamic> toMap() {
    return ProgramMapper.ensureInitialized().encodeMap<Program>(
      this as Program,
    );
  }

  ProgramCopyWith<Program, Program, Program> get copyWith =>
      _ProgramCopyWithImpl<Program, Program>(
        this as Program,
        $identity,
        $identity,
      );
  @override
  String toString() {
    return ProgramMapper.ensureInitialized().stringifyValue(this as Program);
  }

  @override
  bool operator ==(Object other) {
    return ProgramMapper.ensureInitialized().equalsValue(
      this as Program,
      other,
    );
  }

  @override
  int get hashCode {
    return ProgramMapper.ensureInitialized().hashValue(this as Program);
  }
}

extension ProgramValueCopy<$R, $Out> on ObjectCopyWith<$R, Program, $Out> {
  ProgramCopyWith<$R, Program, $Out> get $asProgram =>
      $base.as((v, t, t2) => _ProgramCopyWithImpl<$R, $Out>(v, t, t2));
}

abstract class ProgramCopyWith<$R, $In extends Program, $Out>
    implements ClassCopyWith<$R, $In, $Out> {
  OrganizationCopyWith<$R, Organization, Organization> get owner;
  OrganizationCopyWith<$R, Organization, Organization> get operator;
  ListCopyWith<$R, Recipient, RecipientCopyWith<$R, Recipient, Recipient>>
  get recipients;
  ListCopyWith<$R, Survey, SurveyCopyWith<$R, Survey, Survey>> get surveys;
  $R call({
    String? id,
    String? name,
    int? totalPayments,
    double? payoutAmount,
    Currency? payoutCurrency,
    PayoutInterval? payoutInterval,
    String? country,
    String? viewerOrganizationId,
    String? operatorOrganizationId,
    Organization? owner,
    Organization? operator,
    List<Recipient>? recipients,
    List<Survey>? surveys,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
  ProgramCopyWith<$R2, $In, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t);
}

class _ProgramCopyWithImpl<$R, $Out>
    extends ClassCopyWithBase<$R, Program, $Out>
    implements ProgramCopyWith<$R, Program, $Out> {
  _ProgramCopyWithImpl(super.value, super.then, super.then2);

  @override
  late final ClassMapperBase<Program> $mapper =
      ProgramMapper.ensureInitialized();
  @override
  OrganizationCopyWith<$R, Organization, Organization> get owner =>
      $value.owner.copyWith.$chain((v) => call(owner: v));
  @override
  OrganizationCopyWith<$R, Organization, Organization> get operator =>
      $value.operator.copyWith.$chain((v) => call(operator: v));
  @override
  ListCopyWith<$R, Recipient, RecipientCopyWith<$R, Recipient, Recipient>>
  get recipients => ListCopyWith(
    $value.recipients,
    (v, t) => v.copyWith.$chain(t),
    (v) => call(recipients: v),
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
    String? name,
    int? totalPayments,
    double? payoutAmount,
    Currency? payoutCurrency,
    PayoutInterval? payoutInterval,
    String? country,
    String? viewerOrganizationId,
    String? operatorOrganizationId,
    Organization? owner,
    Organization? operator,
    List<Recipient>? recipients,
    List<Survey>? surveys,
    DateTime? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (name != null) #name: name,
      if (totalPayments != null) #totalPayments: totalPayments,
      if (payoutAmount != null) #payoutAmount: payoutAmount,
      if (payoutCurrency != null) #payoutCurrency: payoutCurrency,
      if (payoutInterval != null) #payoutInterval: payoutInterval,
      if (country != null) #country: country,
      if (viewerOrganizationId != null)
        #viewerOrganizationId: viewerOrganizationId,
      if (operatorOrganizationId != null)
        #operatorOrganizationId: operatorOrganizationId,
      if (owner != null) #owner: owner,
      if (operator != null) #operator: operator,
      if (recipients != null) #recipients: recipients,
      if (surveys != null) #surveys: surveys,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Program $make(CopyWithData data) => Program(
    id: data.get(#id, or: $value.id),
    name: data.get(#name, or: $value.name),
    totalPayments: data.get(#totalPayments, or: $value.totalPayments),
    payoutAmount: data.get(#payoutAmount, or: $value.payoutAmount),
    payoutCurrency: data.get(#payoutCurrency, or: $value.payoutCurrency),
    payoutInterval: data.get(#payoutInterval, or: $value.payoutInterval),
    country: data.get(#country, or: $value.country),
    viewerOrganizationId: data.get(
      #viewerOrganizationId,
      or: $value.viewerOrganizationId,
    ),
    operatorOrganizationId: data.get(
      #operatorOrganizationId,
      or: $value.operatorOrganizationId,
    ),
    owner: data.get(#owner, or: $value.owner),
    operator: data.get(#operator, or: $value.operator),
    recipients: data.get(#recipients, or: $value.recipients),
    surveys: data.get(#surveys, or: $value.surveys),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  ProgramCopyWith<$R2, Program, $Out2> $chain<$R2, $Out2>(Then<$Out2, $R2> t) =>
      _ProgramCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

