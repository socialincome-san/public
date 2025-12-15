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
      ContactMapper.ensureInitialized();
      ProgramMapper.ensureInitialized();
      LocalPartnerMapper.ensureInitialized();
      PaymentInformationMapper.ensureInitialized();
    }
    return _instance!;
  }

  @override
  final String id = 'Recipient';

  static String _$id(Recipient v) => v.id;
  static const Field<Recipient, String> _f$id = Field('id', _$id);
  static String _$contactId(Recipient v) => v.contactId;
  static const Field<Recipient, String> _f$contactId = Field(
    'contactId',
    _$contactId,
  );
  static String _$status(Recipient v) => v.status;
  static const Field<Recipient, String> _f$status = Field('status', _$status);
  static String? _$startDate(Recipient v) => v.startDate;
  static const Field<Recipient, String> _f$startDate = Field(
    'startDate',
    _$startDate,
    opt: true,
  );
  static String? _$successorName(Recipient v) => v.successorName;
  static const Field<Recipient, String> _f$successorName = Field(
    'successorName',
    _$successorName,
    opt: true,
  );
  static bool _$termsAccepted(Recipient v) => v.termsAccepted;
  static const Field<Recipient, bool> _f$termsAccepted = Field(
    'termsAccepted',
    _$termsAccepted,
  );
  static String? _$paymentInformationId(Recipient v) => v.paymentInformationId;
  static const Field<Recipient, String> _f$paymentInformationId = Field(
    'paymentInformationId',
    _$paymentInformationId,
    opt: true,
  );
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
  static Contact _$contact(Recipient v) => v.contact;
  static const Field<Recipient, Contact> _f$contact = Field(
    'contact',
    _$contact,
  );
  static Program _$program(Recipient v) => v.program;
  static const Field<Recipient, Program> _f$program = Field(
    'program',
    _$program,
  );
  static LocalPartner _$localPartner(Recipient v) => v.localPartner;
  static const Field<Recipient, LocalPartner> _f$localPartner = Field(
    'localPartner',
    _$localPartner,
  );
  static PaymentInformation? _$paymentInformation(Recipient v) =>
      v.paymentInformation;
  static const Field<Recipient, PaymentInformation> _f$paymentInformation =
      Field('paymentInformation', _$paymentInformation, opt: true);
  static String _$createdAt(Recipient v) => v.createdAt;
  static const Field<Recipient, String> _f$createdAt = Field(
    'createdAt',
    _$createdAt,
  );
  static String? _$updatedAt(Recipient v) => v.updatedAt;
  static const Field<Recipient, String> _f$updatedAt = Field(
    'updatedAt',
    _$updatedAt,
    opt: true,
  );

  @override
  final MappableFields<Recipient> fields = const {
    #id: _f$id,
    #contactId: _f$contactId,
    #status: _f$status,
    #startDate: _f$startDate,
    #successorName: _f$successorName,
    #termsAccepted: _f$termsAccepted,
    #paymentInformationId: _f$paymentInformationId,
    #programId: _f$programId,
    #localPartnerId: _f$localPartnerId,
    #contact: _f$contact,
    #program: _f$program,
    #localPartner: _f$localPartner,
    #paymentInformation: _f$paymentInformation,
    #createdAt: _f$createdAt,
    #updatedAt: _f$updatedAt,
  };

  static Recipient _instantiate(DecodingData data) {
    return Recipient(
      id: data.dec(_f$id),
      contactId: data.dec(_f$contactId),
      status: data.dec(_f$status),
      startDate: data.dec(_f$startDate),
      successorName: data.dec(_f$successorName),
      termsAccepted: data.dec(_f$termsAccepted),
      paymentInformationId: data.dec(_f$paymentInformationId),
      programId: data.dec(_f$programId),
      localPartnerId: data.dec(_f$localPartnerId),
      contact: data.dec(_f$contact),
      program: data.dec(_f$program),
      localPartner: data.dec(_f$localPartner),
      paymentInformation: data.dec(_f$paymentInformation),
      createdAt: data.dec(_f$createdAt),
      updatedAt: data.dec(_f$updatedAt),
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
  ContactCopyWith<$R, Contact, Contact> get contact;
  ProgramCopyWith<$R, Program, Program> get program;
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner> get localPartner;
  PaymentInformationCopyWith<$R, PaymentInformation, PaymentInformation>?
  get paymentInformation;
  $R call({
    String? id,
    String? contactId,
    String? status,
    String? startDate,
    String? successorName,
    bool? termsAccepted,
    String? paymentInformationId,
    String? programId,
    String? localPartnerId,
    Contact? contact,
    Program? program,
    LocalPartner? localPartner,
    PaymentInformation? paymentInformation,
    String? createdAt,
    String? updatedAt,
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
  ContactCopyWith<$R, Contact, Contact> get contact =>
      $value.contact.copyWith.$chain((v) => call(contact: v));
  @override
  ProgramCopyWith<$R, Program, Program> get program =>
      $value.program.copyWith.$chain((v) => call(program: v));
  @override
  LocalPartnerCopyWith<$R, LocalPartner, LocalPartner> get localPartner =>
      $value.localPartner.copyWith.$chain((v) => call(localPartner: v));
  @override
  PaymentInformationCopyWith<$R, PaymentInformation, PaymentInformation>?
  get paymentInformation => $value.paymentInformation?.copyWith.$chain(
    (v) => call(paymentInformation: v),
  );
  @override
  $R call({
    String? id,
    String? contactId,
    String? status,
    Object? startDate = $none,
    Object? successorName = $none,
    bool? termsAccepted,
    Object? paymentInformationId = $none,
    String? programId,
    String? localPartnerId,
    Contact? contact,
    Program? program,
    LocalPartner? localPartner,
    Object? paymentInformation = $none,
    String? createdAt,
    Object? updatedAt = $none,
  }) => $apply(
    FieldCopyWithData({
      if (id != null) #id: id,
      if (contactId != null) #contactId: contactId,
      if (status != null) #status: status,
      if (startDate != $none) #startDate: startDate,
      if (successorName != $none) #successorName: successorName,
      if (termsAccepted != null) #termsAccepted: termsAccepted,
      if (paymentInformationId != $none)
        #paymentInformationId: paymentInformationId,
      if (programId != null) #programId: programId,
      if (localPartnerId != null) #localPartnerId: localPartnerId,
      if (contact != null) #contact: contact,
      if (program != null) #program: program,
      if (localPartner != null) #localPartner: localPartner,
      if (paymentInformation != $none) #paymentInformation: paymentInformation,
      if (createdAt != null) #createdAt: createdAt,
      if (updatedAt != $none) #updatedAt: updatedAt,
    }),
  );
  @override
  Recipient $make(CopyWithData data) => Recipient(
    id: data.get(#id, or: $value.id),
    contactId: data.get(#contactId, or: $value.contactId),
    status: data.get(#status, or: $value.status),
    startDate: data.get(#startDate, or: $value.startDate),
    successorName: data.get(#successorName, or: $value.successorName),
    termsAccepted: data.get(#termsAccepted, or: $value.termsAccepted),
    paymentInformationId: data.get(
      #paymentInformationId,
      or: $value.paymentInformationId,
    ),
    programId: data.get(#programId, or: $value.programId),
    localPartnerId: data.get(#localPartnerId, or: $value.localPartnerId),
    contact: data.get(#contact, or: $value.contact),
    program: data.get(#program, or: $value.program),
    localPartner: data.get(#localPartner, or: $value.localPartner),
    paymentInformation: data.get(
      #paymentInformation,
      or: $value.paymentInformation,
    ),
    createdAt: data.get(#createdAt, or: $value.createdAt),
    updatedAt: data.get(#updatedAt, or: $value.updatedAt),
  );

  @override
  RecipientCopyWith<$R2, Recipient, $Out2> $chain<$R2, $Out2>(
    Then<$Out2, $R2> t,
  ) => _RecipientCopyWithImpl<$R2, $Out2>($value, $cast, t);
}

