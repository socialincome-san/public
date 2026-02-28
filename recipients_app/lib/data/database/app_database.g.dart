// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $RecipientsTable extends Recipients
    with TableInfo<$RecipientsTable, Recipient> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RecipientsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _recipientJsonMeta = const VerificationMeta(
    'recipientJson',
  );
  @override
  late final GeneratedColumn<String> recipientJson = GeneratedColumn<String>(
    'recipient_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, recipientJson, cachedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'recipients';
  @override
  VerificationContext validateIntegrity(
    Insertable<Recipient> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('recipient_json')) {
      context.handle(
        _recipientJsonMeta,
        recipientJson.isAcceptableOrUnknown(
          data['recipient_json']!,
          _recipientJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_recipientJsonMeta);
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Recipient map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Recipient(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      recipientJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}recipient_json'],
      )!,
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
    );
  }

  @override
  $RecipientsTable createAlias(String alias) {
    return $RecipientsTable(attachedDatabase, alias);
  }
}

class Recipient extends DataClass implements Insertable<Recipient> {
  final String id;
  final String recipientJson;
  final DateTime cachedAt;
  const Recipient({
    required this.id,
    required this.recipientJson,
    required this.cachedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['recipient_json'] = Variable<String>(recipientJson);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    return map;
  }

  RecipientsCompanion toCompanion(bool nullToAbsent) {
    return RecipientsCompanion(
      id: Value(id),
      recipientJson: Value(recipientJson),
      cachedAt: Value(cachedAt),
    );
  }

  factory Recipient.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Recipient(
      id: serializer.fromJson<String>(json['id']),
      recipientJson: serializer.fromJson<String>(json['recipientJson']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'recipientJson': serializer.toJson<String>(recipientJson),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
    };
  }

  Recipient copyWith({String? id, String? recipientJson, DateTime? cachedAt}) =>
      Recipient(
        id: id ?? this.id,
        recipientJson: recipientJson ?? this.recipientJson,
        cachedAt: cachedAt ?? this.cachedAt,
      );
  Recipient copyWithCompanion(RecipientsCompanion data) {
    return Recipient(
      id: data.id.present ? data.id.value : this.id,
      recipientJson: data.recipientJson.present
          ? data.recipientJson.value
          : this.recipientJson,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Recipient(')
          ..write('id: $id, ')
          ..write('recipientJson: $recipientJson, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, recipientJson, cachedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Recipient &&
          other.id == this.id &&
          other.recipientJson == this.recipientJson &&
          other.cachedAt == this.cachedAt);
}

class RecipientsCompanion extends UpdateCompanion<Recipient> {
  final Value<String> id;
  final Value<String> recipientJson;
  final Value<DateTime> cachedAt;
  final Value<int> rowid;
  const RecipientsCompanion({
    this.id = const Value.absent(),
    this.recipientJson = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  RecipientsCompanion.insert({
    required String id,
    required String recipientJson,
    required DateTime cachedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       recipientJson = Value(recipientJson),
       cachedAt = Value(cachedAt);
  static Insertable<Recipient> custom({
    Expression<String>? id,
    Expression<String>? recipientJson,
    Expression<DateTime>? cachedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (recipientJson != null) 'recipient_json': recipientJson,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  RecipientsCompanion copyWith({
    Value<String>? id,
    Value<String>? recipientJson,
    Value<DateTime>? cachedAt,
    Value<int>? rowid,
  }) {
    return RecipientsCompanion(
      id: id ?? this.id,
      recipientJson: recipientJson ?? this.recipientJson,
      cachedAt: cachedAt ?? this.cachedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (recipientJson.present) {
      map['recipient_json'] = Variable<String>(recipientJson.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RecipientsCompanion(')
          ..write('id: $id, ')
          ..write('recipientJson: $recipientJson, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $PayoutsTable extends Payouts with TableInfo<$PayoutsTable, Payout> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PayoutsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _recipientIdMeta = const VerificationMeta(
    'recipientId',
  );
  @override
  late final GeneratedColumn<String> recipientId = GeneratedColumn<String>(
    'recipient_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<int> amount = GeneratedColumn<int>(
    'amount',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _amountChfMeta = const VerificationMeta(
    'amountChf',
  );
  @override
  late final GeneratedColumn<double> amountChf = GeneratedColumn<double>(
    'amount_chf',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _paymentAtMeta = const VerificationMeta(
    'paymentAt',
  );
  @override
  late final GeneratedColumn<String> paymentAt = GeneratedColumn<String>(
    'payment_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _phoneNumberMeta = const VerificationMeta(
    'phoneNumber',
  );
  @override
  late final GeneratedColumn<String> phoneNumber = GeneratedColumn<String>(
    'phone_number',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _commentsMeta = const VerificationMeta(
    'comments',
  );
  @override
  late final GeneratedColumn<String> comments = GeneratedColumn<String>(
    'comments',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    recipientId,
    amount,
    amountChf,
    currency,
    paymentAt,
    status,
    phoneNumber,
    comments,
    createdAt,
    updatedAt,
    cachedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'payouts';
  @override
  VerificationContext validateIntegrity(
    Insertable<Payout> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('recipient_id')) {
      context.handle(
        _recipientIdMeta,
        recipientId.isAcceptableOrUnknown(
          data['recipient_id']!,
          _recipientIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_recipientIdMeta);
    }
    if (data.containsKey('amount')) {
      context.handle(
        _amountMeta,
        amount.isAcceptableOrUnknown(data['amount']!, _amountMeta),
      );
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('amount_chf')) {
      context.handle(
        _amountChfMeta,
        amountChf.isAcceptableOrUnknown(data['amount_chf']!, _amountChfMeta),
      );
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('payment_at')) {
      context.handle(
        _paymentAtMeta,
        paymentAt.isAcceptableOrUnknown(data['payment_at']!, _paymentAtMeta),
      );
    } else if (isInserting) {
      context.missing(_paymentAtMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('phone_number')) {
      context.handle(
        _phoneNumberMeta,
        phoneNumber.isAcceptableOrUnknown(
          data['phone_number']!,
          _phoneNumberMeta,
        ),
      );
    }
    if (data.containsKey('comments')) {
      context.handle(
        _commentsMeta,
        comments.isAcceptableOrUnknown(data['comments']!, _commentsMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Payout map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Payout(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      recipientId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}recipient_id'],
      )!,
      amount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}amount'],
      )!,
      amountChf: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}amount_chf'],
      ),
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      paymentAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payment_at'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      phoneNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}phone_number'],
      ),
      comments: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}comments'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      ),
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
    );
  }

  @override
  $PayoutsTable createAlias(String alias) {
    return $PayoutsTable(attachedDatabase, alias);
  }
}

class Payout extends DataClass implements Insertable<Payout> {
  final String id;
  final String recipientId;
  final int amount;
  final double? amountChf;
  final String currency;
  final String paymentAt;
  final String status;
  final String? phoneNumber;
  final String? comments;
  final String createdAt;
  final String? updatedAt;
  final DateTime cachedAt;
  const Payout({
    required this.id,
    required this.recipientId,
    required this.amount,
    this.amountChf,
    required this.currency,
    required this.paymentAt,
    required this.status,
    this.phoneNumber,
    this.comments,
    required this.createdAt,
    this.updatedAt,
    required this.cachedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['recipient_id'] = Variable<String>(recipientId);
    map['amount'] = Variable<int>(amount);
    if (!nullToAbsent || amountChf != null) {
      map['amount_chf'] = Variable<double>(amountChf);
    }
    map['currency'] = Variable<String>(currency);
    map['payment_at'] = Variable<String>(paymentAt);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || phoneNumber != null) {
      map['phone_number'] = Variable<String>(phoneNumber);
    }
    if (!nullToAbsent || comments != null) {
      map['comments'] = Variable<String>(comments);
    }
    map['created_at'] = Variable<String>(createdAt);
    if (!nullToAbsent || updatedAt != null) {
      map['updated_at'] = Variable<String>(updatedAt);
    }
    map['cached_at'] = Variable<DateTime>(cachedAt);
    return map;
  }

  PayoutsCompanion toCompanion(bool nullToAbsent) {
    return PayoutsCompanion(
      id: Value(id),
      recipientId: Value(recipientId),
      amount: Value(amount),
      amountChf: amountChf == null && nullToAbsent
          ? const Value.absent()
          : Value(amountChf),
      currency: Value(currency),
      paymentAt: Value(paymentAt),
      status: Value(status),
      phoneNumber: phoneNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(phoneNumber),
      comments: comments == null && nullToAbsent
          ? const Value.absent()
          : Value(comments),
      createdAt: Value(createdAt),
      updatedAt: updatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(updatedAt),
      cachedAt: Value(cachedAt),
    );
  }

  factory Payout.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Payout(
      id: serializer.fromJson<String>(json['id']),
      recipientId: serializer.fromJson<String>(json['recipientId']),
      amount: serializer.fromJson<int>(json['amount']),
      amountChf: serializer.fromJson<double?>(json['amountChf']),
      currency: serializer.fromJson<String>(json['currency']),
      paymentAt: serializer.fromJson<String>(json['paymentAt']),
      status: serializer.fromJson<String>(json['status']),
      phoneNumber: serializer.fromJson<String?>(json['phoneNumber']),
      comments: serializer.fromJson<String?>(json['comments']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String?>(json['updatedAt']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'recipientId': serializer.toJson<String>(recipientId),
      'amount': serializer.toJson<int>(amount),
      'amountChf': serializer.toJson<double?>(amountChf),
      'currency': serializer.toJson<String>(currency),
      'paymentAt': serializer.toJson<String>(paymentAt),
      'status': serializer.toJson<String>(status),
      'phoneNumber': serializer.toJson<String?>(phoneNumber),
      'comments': serializer.toJson<String?>(comments),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String?>(updatedAt),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
    };
  }

  Payout copyWith({
    String? id,
    String? recipientId,
    int? amount,
    Value<double?> amountChf = const Value.absent(),
    String? currency,
    String? paymentAt,
    String? status,
    Value<String?> phoneNumber = const Value.absent(),
    Value<String?> comments = const Value.absent(),
    String? createdAt,
    Value<String?> updatedAt = const Value.absent(),
    DateTime? cachedAt,
  }) => Payout(
    id: id ?? this.id,
    recipientId: recipientId ?? this.recipientId,
    amount: amount ?? this.amount,
    amountChf: amountChf.present ? amountChf.value : this.amountChf,
    currency: currency ?? this.currency,
    paymentAt: paymentAt ?? this.paymentAt,
    status: status ?? this.status,
    phoneNumber: phoneNumber.present ? phoneNumber.value : this.phoneNumber,
    comments: comments.present ? comments.value : this.comments,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt.present ? updatedAt.value : this.updatedAt,
    cachedAt: cachedAt ?? this.cachedAt,
  );
  Payout copyWithCompanion(PayoutsCompanion data) {
    return Payout(
      id: data.id.present ? data.id.value : this.id,
      recipientId: data.recipientId.present
          ? data.recipientId.value
          : this.recipientId,
      amount: data.amount.present ? data.amount.value : this.amount,
      amountChf: data.amountChf.present ? data.amountChf.value : this.amountChf,
      currency: data.currency.present ? data.currency.value : this.currency,
      paymentAt: data.paymentAt.present ? data.paymentAt.value : this.paymentAt,
      status: data.status.present ? data.status.value : this.status,
      phoneNumber: data.phoneNumber.present
          ? data.phoneNumber.value
          : this.phoneNumber,
      comments: data.comments.present ? data.comments.value : this.comments,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Payout(')
          ..write('id: $id, ')
          ..write('recipientId: $recipientId, ')
          ..write('amount: $amount, ')
          ..write('amountChf: $amountChf, ')
          ..write('currency: $currency, ')
          ..write('paymentAt: $paymentAt, ')
          ..write('status: $status, ')
          ..write('phoneNumber: $phoneNumber, ')
          ..write('comments: $comments, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    recipientId,
    amount,
    amountChf,
    currency,
    paymentAt,
    status,
    phoneNumber,
    comments,
    createdAt,
    updatedAt,
    cachedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Payout &&
          other.id == this.id &&
          other.recipientId == this.recipientId &&
          other.amount == this.amount &&
          other.amountChf == this.amountChf &&
          other.currency == this.currency &&
          other.paymentAt == this.paymentAt &&
          other.status == this.status &&
          other.phoneNumber == this.phoneNumber &&
          other.comments == this.comments &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.cachedAt == this.cachedAt);
}

class PayoutsCompanion extends UpdateCompanion<Payout> {
  final Value<String> id;
  final Value<String> recipientId;
  final Value<int> amount;
  final Value<double?> amountChf;
  final Value<String> currency;
  final Value<String> paymentAt;
  final Value<String> status;
  final Value<String?> phoneNumber;
  final Value<String?> comments;
  final Value<String> createdAt;
  final Value<String?> updatedAt;
  final Value<DateTime> cachedAt;
  final Value<int> rowid;
  const PayoutsCompanion({
    this.id = const Value.absent(),
    this.recipientId = const Value.absent(),
    this.amount = const Value.absent(),
    this.amountChf = const Value.absent(),
    this.currency = const Value.absent(),
    this.paymentAt = const Value.absent(),
    this.status = const Value.absent(),
    this.phoneNumber = const Value.absent(),
    this.comments = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  PayoutsCompanion.insert({
    required String id,
    required String recipientId,
    required int amount,
    this.amountChf = const Value.absent(),
    required String currency,
    required String paymentAt,
    required String status,
    this.phoneNumber = const Value.absent(),
    this.comments = const Value.absent(),
    required String createdAt,
    this.updatedAt = const Value.absent(),
    required DateTime cachedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       recipientId = Value(recipientId),
       amount = Value(amount),
       currency = Value(currency),
       paymentAt = Value(paymentAt),
       status = Value(status),
       createdAt = Value(createdAt),
       cachedAt = Value(cachedAt);
  static Insertable<Payout> custom({
    Expression<String>? id,
    Expression<String>? recipientId,
    Expression<int>? amount,
    Expression<double>? amountChf,
    Expression<String>? currency,
    Expression<String>? paymentAt,
    Expression<String>? status,
    Expression<String>? phoneNumber,
    Expression<String>? comments,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<DateTime>? cachedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (recipientId != null) 'recipient_id': recipientId,
      if (amount != null) 'amount': amount,
      if (amountChf != null) 'amount_chf': amountChf,
      if (currency != null) 'currency': currency,
      if (paymentAt != null) 'payment_at': paymentAt,
      if (status != null) 'status': status,
      if (phoneNumber != null) 'phone_number': phoneNumber,
      if (comments != null) 'comments': comments,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  PayoutsCompanion copyWith({
    Value<String>? id,
    Value<String>? recipientId,
    Value<int>? amount,
    Value<double?>? amountChf,
    Value<String>? currency,
    Value<String>? paymentAt,
    Value<String>? status,
    Value<String?>? phoneNumber,
    Value<String?>? comments,
    Value<String>? createdAt,
    Value<String?>? updatedAt,
    Value<DateTime>? cachedAt,
    Value<int>? rowid,
  }) {
    return PayoutsCompanion(
      id: id ?? this.id,
      recipientId: recipientId ?? this.recipientId,
      amount: amount ?? this.amount,
      amountChf: amountChf ?? this.amountChf,
      currency: currency ?? this.currency,
      paymentAt: paymentAt ?? this.paymentAt,
      status: status ?? this.status,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      comments: comments ?? this.comments,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      cachedAt: cachedAt ?? this.cachedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (recipientId.present) {
      map['recipient_id'] = Variable<String>(recipientId.value);
    }
    if (amount.present) {
      map['amount'] = Variable<int>(amount.value);
    }
    if (amountChf.present) {
      map['amount_chf'] = Variable<double>(amountChf.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (paymentAt.present) {
      map['payment_at'] = Variable<String>(paymentAt.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (phoneNumber.present) {
      map['phone_number'] = Variable<String>(phoneNumber.value);
    }
    if (comments.present) {
      map['comments'] = Variable<String>(comments.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PayoutsCompanion(')
          ..write('id: $id, ')
          ..write('recipientId: $recipientId, ')
          ..write('amount: $amount, ')
          ..write('amountChf: $amountChf, ')
          ..write('currency: $currency, ')
          ..write('paymentAt: $paymentAt, ')
          ..write('status: $status, ')
          ..write('phoneNumber: $phoneNumber, ')
          ..write('comments: $comments, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SurveysTable extends Surveys with TableInfo<$SurveysTable, Survey> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SurveysTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _recipientIdMeta = const VerificationMeta(
    'recipientId',
  );
  @override
  late final GeneratedColumn<String> recipientId = GeneratedColumn<String>(
    'recipient_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _languageMeta = const VerificationMeta(
    'language',
  );
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
    'language',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dueAtMeta = const VerificationMeta('dueAt');
  @override
  late final GeneratedColumn<String> dueAt = GeneratedColumn<String>(
    'due_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _completedAtMeta = const VerificationMeta(
    'completedAt',
  );
  @override
  late final GeneratedColumn<String> completedAt = GeneratedColumn<String>(
    'completed_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _questionnaireJsonMeta = const VerificationMeta(
    'questionnaireJson',
  );
  @override
  late final GeneratedColumn<String> questionnaireJson =
      GeneratedColumn<String>(
        'questionnaire_json',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: true,
      );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _surveyScheduleIdMeta = const VerificationMeta(
    'surveyScheduleId',
  );
  @override
  late final GeneratedColumn<String> surveyScheduleId = GeneratedColumn<String>(
    'survey_schedule_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _dataJsonMeta = const VerificationMeta(
    'dataJson',
  );
  @override
  late final GeneratedColumn<String> dataJson = GeneratedColumn<String>(
    'data_json',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _accessEmailMeta = const VerificationMeta(
    'accessEmail',
  );
  @override
  late final GeneratedColumn<String> accessEmail = GeneratedColumn<String>(
    'access_email',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _accessPwMeta = const VerificationMeta(
    'accessPw',
  );
  @override
  late final GeneratedColumn<String> accessPw = GeneratedColumn<String>(
    'access_pw',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    recipientId,
    name,
    language,
    dueAt,
    completedAt,
    questionnaireJson,
    status,
    surveyScheduleId,
    dataJson,
    accessEmail,
    accessPw,
    createdAt,
    updatedAt,
    cachedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'surveys';
  @override
  VerificationContext validateIntegrity(
    Insertable<Survey> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('recipient_id')) {
      context.handle(
        _recipientIdMeta,
        recipientId.isAcceptableOrUnknown(
          data['recipient_id']!,
          _recipientIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_recipientIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('language')) {
      context.handle(
        _languageMeta,
        language.isAcceptableOrUnknown(data['language']!, _languageMeta),
      );
    } else if (isInserting) {
      context.missing(_languageMeta);
    }
    if (data.containsKey('due_at')) {
      context.handle(
        _dueAtMeta,
        dueAt.isAcceptableOrUnknown(data['due_at']!, _dueAtMeta),
      );
    } else if (isInserting) {
      context.missing(_dueAtMeta);
    }
    if (data.containsKey('completed_at')) {
      context.handle(
        _completedAtMeta,
        completedAt.isAcceptableOrUnknown(
          data['completed_at']!,
          _completedAtMeta,
        ),
      );
    }
    if (data.containsKey('questionnaire_json')) {
      context.handle(
        _questionnaireJsonMeta,
        questionnaireJson.isAcceptableOrUnknown(
          data['questionnaire_json']!,
          _questionnaireJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_questionnaireJsonMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('survey_schedule_id')) {
      context.handle(
        _surveyScheduleIdMeta,
        surveyScheduleId.isAcceptableOrUnknown(
          data['survey_schedule_id']!,
          _surveyScheduleIdMeta,
        ),
      );
    }
    if (data.containsKey('data_json')) {
      context.handle(
        _dataJsonMeta,
        dataJson.isAcceptableOrUnknown(data['data_json']!, _dataJsonMeta),
      );
    }
    if (data.containsKey('access_email')) {
      context.handle(
        _accessEmailMeta,
        accessEmail.isAcceptableOrUnknown(
          data['access_email']!,
          _accessEmailMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_accessEmailMeta);
    }
    if (data.containsKey('access_pw')) {
      context.handle(
        _accessPwMeta,
        accessPw.isAcceptableOrUnknown(data['access_pw']!, _accessPwMeta),
      );
    } else if (isInserting) {
      context.missing(_accessPwMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Survey map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Survey(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      recipientId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}recipient_id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      language: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}language'],
      )!,
      dueAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}due_at'],
      )!,
      completedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}completed_at'],
      ),
      questionnaireJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}questionnaire_json'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      surveyScheduleId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}survey_schedule_id'],
      ),
      dataJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data_json'],
      ),
      accessEmail: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_email'],
      )!,
      accessPw: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_pw'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      ),
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
    );
  }

  @override
  $SurveysTable createAlias(String alias) {
    return $SurveysTable(attachedDatabase, alias);
  }
}

class Survey extends DataClass implements Insertable<Survey> {
  final String id;
  final String recipientId;
  final String name;
  final String language;
  final String dueAt;
  final String? completedAt;
  final String questionnaireJson;
  final String status;
  final String? surveyScheduleId;
  final String? dataJson;
  final String accessEmail;
  final String accessPw;
  final String createdAt;
  final String? updatedAt;
  final DateTime cachedAt;
  const Survey({
    required this.id,
    required this.recipientId,
    required this.name,
    required this.language,
    required this.dueAt,
    this.completedAt,
    required this.questionnaireJson,
    required this.status,
    this.surveyScheduleId,
    this.dataJson,
    required this.accessEmail,
    required this.accessPw,
    required this.createdAt,
    this.updatedAt,
    required this.cachedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['recipient_id'] = Variable<String>(recipientId);
    map['name'] = Variable<String>(name);
    map['language'] = Variable<String>(language);
    map['due_at'] = Variable<String>(dueAt);
    if (!nullToAbsent || completedAt != null) {
      map['completed_at'] = Variable<String>(completedAt);
    }
    map['questionnaire_json'] = Variable<String>(questionnaireJson);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || surveyScheduleId != null) {
      map['survey_schedule_id'] = Variable<String>(surveyScheduleId);
    }
    if (!nullToAbsent || dataJson != null) {
      map['data_json'] = Variable<String>(dataJson);
    }
    map['access_email'] = Variable<String>(accessEmail);
    map['access_pw'] = Variable<String>(accessPw);
    map['created_at'] = Variable<String>(createdAt);
    if (!nullToAbsent || updatedAt != null) {
      map['updated_at'] = Variable<String>(updatedAt);
    }
    map['cached_at'] = Variable<DateTime>(cachedAt);
    return map;
  }

  SurveysCompanion toCompanion(bool nullToAbsent) {
    return SurveysCompanion(
      id: Value(id),
      recipientId: Value(recipientId),
      name: Value(name),
      language: Value(language),
      dueAt: Value(dueAt),
      completedAt: completedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(completedAt),
      questionnaireJson: Value(questionnaireJson),
      status: Value(status),
      surveyScheduleId: surveyScheduleId == null && nullToAbsent
          ? const Value.absent()
          : Value(surveyScheduleId),
      dataJson: dataJson == null && nullToAbsent
          ? const Value.absent()
          : Value(dataJson),
      accessEmail: Value(accessEmail),
      accessPw: Value(accessPw),
      createdAt: Value(createdAt),
      updatedAt: updatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(updatedAt),
      cachedAt: Value(cachedAt),
    );
  }

  factory Survey.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Survey(
      id: serializer.fromJson<String>(json['id']),
      recipientId: serializer.fromJson<String>(json['recipientId']),
      name: serializer.fromJson<String>(json['name']),
      language: serializer.fromJson<String>(json['language']),
      dueAt: serializer.fromJson<String>(json['dueAt']),
      completedAt: serializer.fromJson<String?>(json['completedAt']),
      questionnaireJson: serializer.fromJson<String>(json['questionnaireJson']),
      status: serializer.fromJson<String>(json['status']),
      surveyScheduleId: serializer.fromJson<String?>(json['surveyScheduleId']),
      dataJson: serializer.fromJson<String?>(json['dataJson']),
      accessEmail: serializer.fromJson<String>(json['accessEmail']),
      accessPw: serializer.fromJson<String>(json['accessPw']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String?>(json['updatedAt']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'recipientId': serializer.toJson<String>(recipientId),
      'name': serializer.toJson<String>(name),
      'language': serializer.toJson<String>(language),
      'dueAt': serializer.toJson<String>(dueAt),
      'completedAt': serializer.toJson<String?>(completedAt),
      'questionnaireJson': serializer.toJson<String>(questionnaireJson),
      'status': serializer.toJson<String>(status),
      'surveyScheduleId': serializer.toJson<String?>(surveyScheduleId),
      'dataJson': serializer.toJson<String?>(dataJson),
      'accessEmail': serializer.toJson<String>(accessEmail),
      'accessPw': serializer.toJson<String>(accessPw),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String?>(updatedAt),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
    };
  }

  Survey copyWith({
    String? id,
    String? recipientId,
    String? name,
    String? language,
    String? dueAt,
    Value<String?> completedAt = const Value.absent(),
    String? questionnaireJson,
    String? status,
    Value<String?> surveyScheduleId = const Value.absent(),
    Value<String?> dataJson = const Value.absent(),
    String? accessEmail,
    String? accessPw,
    String? createdAt,
    Value<String?> updatedAt = const Value.absent(),
    DateTime? cachedAt,
  }) => Survey(
    id: id ?? this.id,
    recipientId: recipientId ?? this.recipientId,
    name: name ?? this.name,
    language: language ?? this.language,
    dueAt: dueAt ?? this.dueAt,
    completedAt: completedAt.present ? completedAt.value : this.completedAt,
    questionnaireJson: questionnaireJson ?? this.questionnaireJson,
    status: status ?? this.status,
    surveyScheduleId: surveyScheduleId.present
        ? surveyScheduleId.value
        : this.surveyScheduleId,
    dataJson: dataJson.present ? dataJson.value : this.dataJson,
    accessEmail: accessEmail ?? this.accessEmail,
    accessPw: accessPw ?? this.accessPw,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt.present ? updatedAt.value : this.updatedAt,
    cachedAt: cachedAt ?? this.cachedAt,
  );
  Survey copyWithCompanion(SurveysCompanion data) {
    return Survey(
      id: data.id.present ? data.id.value : this.id,
      recipientId: data.recipientId.present
          ? data.recipientId.value
          : this.recipientId,
      name: data.name.present ? data.name.value : this.name,
      language: data.language.present ? data.language.value : this.language,
      dueAt: data.dueAt.present ? data.dueAt.value : this.dueAt,
      completedAt: data.completedAt.present
          ? data.completedAt.value
          : this.completedAt,
      questionnaireJson: data.questionnaireJson.present
          ? data.questionnaireJson.value
          : this.questionnaireJson,
      status: data.status.present ? data.status.value : this.status,
      surveyScheduleId: data.surveyScheduleId.present
          ? data.surveyScheduleId.value
          : this.surveyScheduleId,
      dataJson: data.dataJson.present ? data.dataJson.value : this.dataJson,
      accessEmail: data.accessEmail.present
          ? data.accessEmail.value
          : this.accessEmail,
      accessPw: data.accessPw.present ? data.accessPw.value : this.accessPw,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Survey(')
          ..write('id: $id, ')
          ..write('recipientId: $recipientId, ')
          ..write('name: $name, ')
          ..write('language: $language, ')
          ..write('dueAt: $dueAt, ')
          ..write('completedAt: $completedAt, ')
          ..write('questionnaireJson: $questionnaireJson, ')
          ..write('status: $status, ')
          ..write('surveyScheduleId: $surveyScheduleId, ')
          ..write('dataJson: $dataJson, ')
          ..write('accessEmail: $accessEmail, ')
          ..write('accessPw: $accessPw, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    recipientId,
    name,
    language,
    dueAt,
    completedAt,
    questionnaireJson,
    status,
    surveyScheduleId,
    dataJson,
    accessEmail,
    accessPw,
    createdAt,
    updatedAt,
    cachedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Survey &&
          other.id == this.id &&
          other.recipientId == this.recipientId &&
          other.name == this.name &&
          other.language == this.language &&
          other.dueAt == this.dueAt &&
          other.completedAt == this.completedAt &&
          other.questionnaireJson == this.questionnaireJson &&
          other.status == this.status &&
          other.surveyScheduleId == this.surveyScheduleId &&
          other.dataJson == this.dataJson &&
          other.accessEmail == this.accessEmail &&
          other.accessPw == this.accessPw &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.cachedAt == this.cachedAt);
}

class SurveysCompanion extends UpdateCompanion<Survey> {
  final Value<String> id;
  final Value<String> recipientId;
  final Value<String> name;
  final Value<String> language;
  final Value<String> dueAt;
  final Value<String?> completedAt;
  final Value<String> questionnaireJson;
  final Value<String> status;
  final Value<String?> surveyScheduleId;
  final Value<String?> dataJson;
  final Value<String> accessEmail;
  final Value<String> accessPw;
  final Value<String> createdAt;
  final Value<String?> updatedAt;
  final Value<DateTime> cachedAt;
  final Value<int> rowid;
  const SurveysCompanion({
    this.id = const Value.absent(),
    this.recipientId = const Value.absent(),
    this.name = const Value.absent(),
    this.language = const Value.absent(),
    this.dueAt = const Value.absent(),
    this.completedAt = const Value.absent(),
    this.questionnaireJson = const Value.absent(),
    this.status = const Value.absent(),
    this.surveyScheduleId = const Value.absent(),
    this.dataJson = const Value.absent(),
    this.accessEmail = const Value.absent(),
    this.accessPw = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SurveysCompanion.insert({
    required String id,
    required String recipientId,
    required String name,
    required String language,
    required String dueAt,
    this.completedAt = const Value.absent(),
    required String questionnaireJson,
    required String status,
    this.surveyScheduleId = const Value.absent(),
    this.dataJson = const Value.absent(),
    required String accessEmail,
    required String accessPw,
    required String createdAt,
    this.updatedAt = const Value.absent(),
    required DateTime cachedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       recipientId = Value(recipientId),
       name = Value(name),
       language = Value(language),
       dueAt = Value(dueAt),
       questionnaireJson = Value(questionnaireJson),
       status = Value(status),
       accessEmail = Value(accessEmail),
       accessPw = Value(accessPw),
       createdAt = Value(createdAt),
       cachedAt = Value(cachedAt);
  static Insertable<Survey> custom({
    Expression<String>? id,
    Expression<String>? recipientId,
    Expression<String>? name,
    Expression<String>? language,
    Expression<String>? dueAt,
    Expression<String>? completedAt,
    Expression<String>? questionnaireJson,
    Expression<String>? status,
    Expression<String>? surveyScheduleId,
    Expression<String>? dataJson,
    Expression<String>? accessEmail,
    Expression<String>? accessPw,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<DateTime>? cachedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (recipientId != null) 'recipient_id': recipientId,
      if (name != null) 'name': name,
      if (language != null) 'language': language,
      if (dueAt != null) 'due_at': dueAt,
      if (completedAt != null) 'completed_at': completedAt,
      if (questionnaireJson != null) 'questionnaire_json': questionnaireJson,
      if (status != null) 'status': status,
      if (surveyScheduleId != null) 'survey_schedule_id': surveyScheduleId,
      if (dataJson != null) 'data_json': dataJson,
      if (accessEmail != null) 'access_email': accessEmail,
      if (accessPw != null) 'access_pw': accessPw,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SurveysCompanion copyWith({
    Value<String>? id,
    Value<String>? recipientId,
    Value<String>? name,
    Value<String>? language,
    Value<String>? dueAt,
    Value<String?>? completedAt,
    Value<String>? questionnaireJson,
    Value<String>? status,
    Value<String?>? surveyScheduleId,
    Value<String?>? dataJson,
    Value<String>? accessEmail,
    Value<String>? accessPw,
    Value<String>? createdAt,
    Value<String?>? updatedAt,
    Value<DateTime>? cachedAt,
    Value<int>? rowid,
  }) {
    return SurveysCompanion(
      id: id ?? this.id,
      recipientId: recipientId ?? this.recipientId,
      name: name ?? this.name,
      language: language ?? this.language,
      dueAt: dueAt ?? this.dueAt,
      completedAt: completedAt ?? this.completedAt,
      questionnaireJson: questionnaireJson ?? this.questionnaireJson,
      status: status ?? this.status,
      surveyScheduleId: surveyScheduleId ?? this.surveyScheduleId,
      dataJson: dataJson ?? this.dataJson,
      accessEmail: accessEmail ?? this.accessEmail,
      accessPw: accessPw ?? this.accessPw,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      cachedAt: cachedAt ?? this.cachedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (recipientId.present) {
      map['recipient_id'] = Variable<String>(recipientId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (language.present) {
      map['language'] = Variable<String>(language.value);
    }
    if (dueAt.present) {
      map['due_at'] = Variable<String>(dueAt.value);
    }
    if (completedAt.present) {
      map['completed_at'] = Variable<String>(completedAt.value);
    }
    if (questionnaireJson.present) {
      map['questionnaire_json'] = Variable<String>(questionnaireJson.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (surveyScheduleId.present) {
      map['survey_schedule_id'] = Variable<String>(surveyScheduleId.value);
    }
    if (dataJson.present) {
      map['data_json'] = Variable<String>(dataJson.value);
    }
    if (accessEmail.present) {
      map['access_email'] = Variable<String>(accessEmail.value);
    }
    if (accessPw.present) {
      map['access_pw'] = Variable<String>(accessPw.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SurveysCompanion(')
          ..write('id: $id, ')
          ..write('recipientId: $recipientId, ')
          ..write('name: $name, ')
          ..write('language: $language, ')
          ..write('dueAt: $dueAt, ')
          ..write('completedAt: $completedAt, ')
          ..write('questionnaireJson: $questionnaireJson, ')
          ..write('status: $status, ')
          ..write('surveyScheduleId: $surveyScheduleId, ')
          ..write('dataJson: $dataJson, ')
          ..write('accessEmail: $accessEmail, ')
          ..write('accessPw: $accessPw, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $UpdateQueueTable extends UpdateQueue
    with TableInfo<$UpdateQueueTable, UpdateQueueData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UpdateQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _operationTypeMeta = const VerificationMeta(
    'operationType',
  );
  @override
  late final GeneratedColumn<String> operationType = GeneratedColumn<String>(
    'operation_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _operationPayloadMeta = const VerificationMeta(
    'operationPayload',
  );
  @override
  late final GeneratedColumn<String> operationPayload = GeneratedColumn<String>(
    'operation_payload',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _retryCountMeta = const VerificationMeta(
    'retryCount',
  );
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
    'retry_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant("pending"),
  );
  static const VerificationMeta _errorMeta = const VerificationMeta('error');
  @override
  late final GeneratedColumn<String> error = GeneratedColumn<String>(
    'error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    operationType,
    operationPayload,
    createdAt,
    retryCount,
    status,
    error,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'update_queue';
  @override
  VerificationContext validateIntegrity(
    Insertable<UpdateQueueData> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('operation_type')) {
      context.handle(
        _operationTypeMeta,
        operationType.isAcceptableOrUnknown(
          data['operation_type']!,
          _operationTypeMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_operationTypeMeta);
    }
    if (data.containsKey('operation_payload')) {
      context.handle(
        _operationPayloadMeta,
        operationPayload.isAcceptableOrUnknown(
          data['operation_payload']!,
          _operationPayloadMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_operationPayloadMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
        _retryCountMeta,
        retryCount.isAcceptableOrUnknown(data['retry_count']!, _retryCountMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('error')) {
      context.handle(
        _errorMeta,
        error.isAcceptableOrUnknown(data['error']!, _errorMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  UpdateQueueData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return UpdateQueueData(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      operationType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}operation_type'],
      )!,
      operationPayload: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}operation_payload'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      retryCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}retry_count'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      error: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}error'],
      ),
    );
  }

  @override
  $UpdateQueueTable createAlias(String alias) {
    return $UpdateQueueTable(attachedDatabase, alias);
  }
}

class UpdateQueueData extends DataClass implements Insertable<UpdateQueueData> {
  final int id;
  final String operationType;
  final String operationPayload;
  final DateTime createdAt;
  final int retryCount;
  final String status;
  final String? error;
  const UpdateQueueData({
    required this.id,
    required this.operationType,
    required this.operationPayload,
    required this.createdAt,
    required this.retryCount,
    required this.status,
    this.error,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['operation_type'] = Variable<String>(operationType);
    map['operation_payload'] = Variable<String>(operationPayload);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['retry_count'] = Variable<int>(retryCount);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || error != null) {
      map['error'] = Variable<String>(error);
    }
    return map;
  }

  UpdateQueueCompanion toCompanion(bool nullToAbsent) {
    return UpdateQueueCompanion(
      id: Value(id),
      operationType: Value(operationType),
      operationPayload: Value(operationPayload),
      createdAt: Value(createdAt),
      retryCount: Value(retryCount),
      status: Value(status),
      error: error == null && nullToAbsent
          ? const Value.absent()
          : Value(error),
    );
  }

  factory UpdateQueueData.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return UpdateQueueData(
      id: serializer.fromJson<int>(json['id']),
      operationType: serializer.fromJson<String>(json['operationType']),
      operationPayload: serializer.fromJson<String>(json['operationPayload']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      status: serializer.fromJson<String>(json['status']),
      error: serializer.fromJson<String?>(json['error']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'operationType': serializer.toJson<String>(operationType),
      'operationPayload': serializer.toJson<String>(operationPayload),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'retryCount': serializer.toJson<int>(retryCount),
      'status': serializer.toJson<String>(status),
      'error': serializer.toJson<String?>(error),
    };
  }

  UpdateQueueData copyWith({
    int? id,
    String? operationType,
    String? operationPayload,
    DateTime? createdAt,
    int? retryCount,
    String? status,
    Value<String?> error = const Value.absent(),
  }) => UpdateQueueData(
    id: id ?? this.id,
    operationType: operationType ?? this.operationType,
    operationPayload: operationPayload ?? this.operationPayload,
    createdAt: createdAt ?? this.createdAt,
    retryCount: retryCount ?? this.retryCount,
    status: status ?? this.status,
    error: error.present ? error.value : this.error,
  );
  UpdateQueueData copyWithCompanion(UpdateQueueCompanion data) {
    return UpdateQueueData(
      id: data.id.present ? data.id.value : this.id,
      operationType: data.operationType.present
          ? data.operationType.value
          : this.operationType,
      operationPayload: data.operationPayload.present
          ? data.operationPayload.value
          : this.operationPayload,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      retryCount: data.retryCount.present
          ? data.retryCount.value
          : this.retryCount,
      status: data.status.present ? data.status.value : this.status,
      error: data.error.present ? data.error.value : this.error,
    );
  }

  @override
  String toString() {
    return (StringBuffer('UpdateQueueData(')
          ..write('id: $id, ')
          ..write('operationType: $operationType, ')
          ..write('operationPayload: $operationPayload, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('error: $error')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    operationType,
    operationPayload,
    createdAt,
    retryCount,
    status,
    error,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is UpdateQueueData &&
          other.id == this.id &&
          other.operationType == this.operationType &&
          other.operationPayload == this.operationPayload &&
          other.createdAt == this.createdAt &&
          other.retryCount == this.retryCount &&
          other.status == this.status &&
          other.error == this.error);
}

class UpdateQueueCompanion extends UpdateCompanion<UpdateQueueData> {
  final Value<int> id;
  final Value<String> operationType;
  final Value<String> operationPayload;
  final Value<DateTime> createdAt;
  final Value<int> retryCount;
  final Value<String> status;
  final Value<String?> error;
  const UpdateQueueCompanion({
    this.id = const Value.absent(),
    this.operationType = const Value.absent(),
    this.operationPayload = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.error = const Value.absent(),
  });
  UpdateQueueCompanion.insert({
    this.id = const Value.absent(),
    required String operationType,
    required String operationPayload,
    required DateTime createdAt,
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.error = const Value.absent(),
  }) : operationType = Value(operationType),
       operationPayload = Value(operationPayload),
       createdAt = Value(createdAt);
  static Insertable<UpdateQueueData> custom({
    Expression<int>? id,
    Expression<String>? operationType,
    Expression<String>? operationPayload,
    Expression<DateTime>? createdAt,
    Expression<int>? retryCount,
    Expression<String>? status,
    Expression<String>? error,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (operationType != null) 'operation_type': operationType,
      if (operationPayload != null) 'operation_payload': operationPayload,
      if (createdAt != null) 'created_at': createdAt,
      if (retryCount != null) 'retry_count': retryCount,
      if (status != null) 'status': status,
      if (error != null) 'error': error,
    });
  }

  UpdateQueueCompanion copyWith({
    Value<int>? id,
    Value<String>? operationType,
    Value<String>? operationPayload,
    Value<DateTime>? createdAt,
    Value<int>? retryCount,
    Value<String>? status,
    Value<String?>? error,
  }) {
    return UpdateQueueCompanion(
      id: id ?? this.id,
      operationType: operationType ?? this.operationType,
      operationPayload: operationPayload ?? this.operationPayload,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (operationType.present) {
      map['operation_type'] = Variable<String>(operationType.value);
    }
    if (operationPayload.present) {
      map['operation_payload'] = Variable<String>(operationPayload.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (error.present) {
      map['error'] = Variable<String>(error.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UpdateQueueCompanion(')
          ..write('id: $id, ')
          ..write('operationType: $operationType, ')
          ..write('operationPayload: $operationPayload, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('error: $error')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $RecipientsTable recipients = $RecipientsTable(this);
  late final $PayoutsTable payouts = $PayoutsTable(this);
  late final $SurveysTable surveys = $SurveysTable(this);
  late final $UpdateQueueTable updateQueue = $UpdateQueueTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    recipients,
    payouts,
    surveys,
    updateQueue,
  ];
}

typedef $$RecipientsTableCreateCompanionBuilder =
    RecipientsCompanion Function({
      required String id,
      required String recipientJson,
      required DateTime cachedAt,
      Value<int> rowid,
    });
typedef $$RecipientsTableUpdateCompanionBuilder =
    RecipientsCompanion Function({
      Value<String> id,
      Value<String> recipientJson,
      Value<DateTime> cachedAt,
      Value<int> rowid,
    });

class $$RecipientsTableFilterComposer
    extends Composer<_$AppDatabase, $RecipientsTable> {
  $$RecipientsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get recipientJson => $composableBuilder(
    column: $table.recipientJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$RecipientsTableOrderingComposer
    extends Composer<_$AppDatabase, $RecipientsTable> {
  $$RecipientsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get recipientJson => $composableBuilder(
    column: $table.recipientJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$RecipientsTableAnnotationComposer
    extends Composer<_$AppDatabase, $RecipientsTable> {
  $$RecipientsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get recipientJson => $composableBuilder(
    column: $table.recipientJson,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);
}

class $$RecipientsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $RecipientsTable,
          Recipient,
          $$RecipientsTableFilterComposer,
          $$RecipientsTableOrderingComposer,
          $$RecipientsTableAnnotationComposer,
          $$RecipientsTableCreateCompanionBuilder,
          $$RecipientsTableUpdateCompanionBuilder,
          (
            Recipient,
            BaseReferences<_$AppDatabase, $RecipientsTable, Recipient>,
          ),
          Recipient,
          PrefetchHooks Function()
        > {
  $$RecipientsTableTableManager(_$AppDatabase db, $RecipientsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$RecipientsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$RecipientsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$RecipientsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> recipientJson = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => RecipientsCompanion(
                id: id,
                recipientJson: recipientJson,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String recipientJson,
                required DateTime cachedAt,
                Value<int> rowid = const Value.absent(),
              }) => RecipientsCompanion.insert(
                id: id,
                recipientJson: recipientJson,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$RecipientsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $RecipientsTable,
      Recipient,
      $$RecipientsTableFilterComposer,
      $$RecipientsTableOrderingComposer,
      $$RecipientsTableAnnotationComposer,
      $$RecipientsTableCreateCompanionBuilder,
      $$RecipientsTableUpdateCompanionBuilder,
      (Recipient, BaseReferences<_$AppDatabase, $RecipientsTable, Recipient>),
      Recipient,
      PrefetchHooks Function()
    >;
typedef $$PayoutsTableCreateCompanionBuilder =
    PayoutsCompanion Function({
      required String id,
      required String recipientId,
      required int amount,
      Value<double?> amountChf,
      required String currency,
      required String paymentAt,
      required String status,
      Value<String?> phoneNumber,
      Value<String?> comments,
      required String createdAt,
      Value<String?> updatedAt,
      required DateTime cachedAt,
      Value<int> rowid,
    });
typedef $$PayoutsTableUpdateCompanionBuilder =
    PayoutsCompanion Function({
      Value<String> id,
      Value<String> recipientId,
      Value<int> amount,
      Value<double?> amountChf,
      Value<String> currency,
      Value<String> paymentAt,
      Value<String> status,
      Value<String?> phoneNumber,
      Value<String?> comments,
      Value<String> createdAt,
      Value<String?> updatedAt,
      Value<DateTime> cachedAt,
      Value<int> rowid,
    });

class $$PayoutsTableFilterComposer
    extends Composer<_$AppDatabase, $PayoutsTable> {
  $$PayoutsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get amountChf => $composableBuilder(
    column: $table.amountChf,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get paymentAt => $composableBuilder(
    column: $table.paymentAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get phoneNumber => $composableBuilder(
    column: $table.phoneNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get comments => $composableBuilder(
    column: $table.comments,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$PayoutsTableOrderingComposer
    extends Composer<_$AppDatabase, $PayoutsTable> {
  $$PayoutsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get amountChf => $composableBuilder(
    column: $table.amountChf,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get paymentAt => $composableBuilder(
    column: $table.paymentAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get phoneNumber => $composableBuilder(
    column: $table.phoneNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get comments => $composableBuilder(
    column: $table.comments,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$PayoutsTableAnnotationComposer
    extends Composer<_$AppDatabase, $PayoutsTable> {
  $$PayoutsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<double> get amountChf =>
      $composableBuilder(column: $table.amountChf, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get paymentAt =>
      $composableBuilder(column: $table.paymentAt, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get phoneNumber => $composableBuilder(
    column: $table.phoneNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get comments =>
      $composableBuilder(column: $table.comments, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);
}

class $$PayoutsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $PayoutsTable,
          Payout,
          $$PayoutsTableFilterComposer,
          $$PayoutsTableOrderingComposer,
          $$PayoutsTableAnnotationComposer,
          $$PayoutsTableCreateCompanionBuilder,
          $$PayoutsTableUpdateCompanionBuilder,
          (Payout, BaseReferences<_$AppDatabase, $PayoutsTable, Payout>),
          Payout,
          PrefetchHooks Function()
        > {
  $$PayoutsTableTableManager(_$AppDatabase db, $PayoutsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PayoutsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PayoutsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PayoutsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> recipientId = const Value.absent(),
                Value<int> amount = const Value.absent(),
                Value<double?> amountChf = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String> paymentAt = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> phoneNumber = const Value.absent(),
                Value<String?> comments = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String?> updatedAt = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => PayoutsCompanion(
                id: id,
                recipientId: recipientId,
                amount: amount,
                amountChf: amountChf,
                currency: currency,
                paymentAt: paymentAt,
                status: status,
                phoneNumber: phoneNumber,
                comments: comments,
                createdAt: createdAt,
                updatedAt: updatedAt,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String recipientId,
                required int amount,
                Value<double?> amountChf = const Value.absent(),
                required String currency,
                required String paymentAt,
                required String status,
                Value<String?> phoneNumber = const Value.absent(),
                Value<String?> comments = const Value.absent(),
                required String createdAt,
                Value<String?> updatedAt = const Value.absent(),
                required DateTime cachedAt,
                Value<int> rowid = const Value.absent(),
              }) => PayoutsCompanion.insert(
                id: id,
                recipientId: recipientId,
                amount: amount,
                amountChf: amountChf,
                currency: currency,
                paymentAt: paymentAt,
                status: status,
                phoneNumber: phoneNumber,
                comments: comments,
                createdAt: createdAt,
                updatedAt: updatedAt,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$PayoutsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $PayoutsTable,
      Payout,
      $$PayoutsTableFilterComposer,
      $$PayoutsTableOrderingComposer,
      $$PayoutsTableAnnotationComposer,
      $$PayoutsTableCreateCompanionBuilder,
      $$PayoutsTableUpdateCompanionBuilder,
      (Payout, BaseReferences<_$AppDatabase, $PayoutsTable, Payout>),
      Payout,
      PrefetchHooks Function()
    >;
typedef $$SurveysTableCreateCompanionBuilder =
    SurveysCompanion Function({
      required String id,
      required String recipientId,
      required String name,
      required String language,
      required String dueAt,
      Value<String?> completedAt,
      required String questionnaireJson,
      required String status,
      Value<String?> surveyScheduleId,
      Value<String?> dataJson,
      required String accessEmail,
      required String accessPw,
      required String createdAt,
      Value<String?> updatedAt,
      required DateTime cachedAt,
      Value<int> rowid,
    });
typedef $$SurveysTableUpdateCompanionBuilder =
    SurveysCompanion Function({
      Value<String> id,
      Value<String> recipientId,
      Value<String> name,
      Value<String> language,
      Value<String> dueAt,
      Value<String?> completedAt,
      Value<String> questionnaireJson,
      Value<String> status,
      Value<String?> surveyScheduleId,
      Value<String?> dataJson,
      Value<String> accessEmail,
      Value<String> accessPw,
      Value<String> createdAt,
      Value<String?> updatedAt,
      Value<DateTime> cachedAt,
      Value<int> rowid,
    });

class $$SurveysTableFilterComposer
    extends Composer<_$AppDatabase, $SurveysTable> {
  $$SurveysTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dueAt => $composableBuilder(
    column: $table.dueAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get completedAt => $composableBuilder(
    column: $table.completedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get questionnaireJson => $composableBuilder(
    column: $table.questionnaireJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get surveyScheduleId => $composableBuilder(
    column: $table.surveyScheduleId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dataJson => $composableBuilder(
    column: $table.dataJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessEmail => $composableBuilder(
    column: $table.accessEmail,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessPw => $composableBuilder(
    column: $table.accessPw,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SurveysTableOrderingComposer
    extends Composer<_$AppDatabase, $SurveysTable> {
  $$SurveysTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dueAt => $composableBuilder(
    column: $table.dueAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get completedAt => $composableBuilder(
    column: $table.completedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get questionnaireJson => $composableBuilder(
    column: $table.questionnaireJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get surveyScheduleId => $composableBuilder(
    column: $table.surveyScheduleId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dataJson => $composableBuilder(
    column: $table.dataJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessEmail => $composableBuilder(
    column: $table.accessEmail,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessPw => $composableBuilder(
    column: $table.accessPw,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SurveysTableAnnotationComposer
    extends Composer<_$AppDatabase, $SurveysTable> {
  $$SurveysTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get recipientId => $composableBuilder(
    column: $table.recipientId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get language =>
      $composableBuilder(column: $table.language, builder: (column) => column);

  GeneratedColumn<String> get dueAt =>
      $composableBuilder(column: $table.dueAt, builder: (column) => column);

  GeneratedColumn<String> get completedAt => $composableBuilder(
    column: $table.completedAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get questionnaireJson => $composableBuilder(
    column: $table.questionnaireJson,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get surveyScheduleId => $composableBuilder(
    column: $table.surveyScheduleId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get dataJson =>
      $composableBuilder(column: $table.dataJson, builder: (column) => column);

  GeneratedColumn<String> get accessEmail => $composableBuilder(
    column: $table.accessEmail,
    builder: (column) => column,
  );

  GeneratedColumn<String> get accessPw =>
      $composableBuilder(column: $table.accessPw, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);
}

class $$SurveysTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $SurveysTable,
          Survey,
          $$SurveysTableFilterComposer,
          $$SurveysTableOrderingComposer,
          $$SurveysTableAnnotationComposer,
          $$SurveysTableCreateCompanionBuilder,
          $$SurveysTableUpdateCompanionBuilder,
          (Survey, BaseReferences<_$AppDatabase, $SurveysTable, Survey>),
          Survey,
          PrefetchHooks Function()
        > {
  $$SurveysTableTableManager(_$AppDatabase db, $SurveysTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SurveysTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SurveysTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SurveysTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> recipientId = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> language = const Value.absent(),
                Value<String> dueAt = const Value.absent(),
                Value<String?> completedAt = const Value.absent(),
                Value<String> questionnaireJson = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> surveyScheduleId = const Value.absent(),
                Value<String?> dataJson = const Value.absent(),
                Value<String> accessEmail = const Value.absent(),
                Value<String> accessPw = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String?> updatedAt = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SurveysCompanion(
                id: id,
                recipientId: recipientId,
                name: name,
                language: language,
                dueAt: dueAt,
                completedAt: completedAt,
                questionnaireJson: questionnaireJson,
                status: status,
                surveyScheduleId: surveyScheduleId,
                dataJson: dataJson,
                accessEmail: accessEmail,
                accessPw: accessPw,
                createdAt: createdAt,
                updatedAt: updatedAt,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String recipientId,
                required String name,
                required String language,
                required String dueAt,
                Value<String?> completedAt = const Value.absent(),
                required String questionnaireJson,
                required String status,
                Value<String?> surveyScheduleId = const Value.absent(),
                Value<String?> dataJson = const Value.absent(),
                required String accessEmail,
                required String accessPw,
                required String createdAt,
                Value<String?> updatedAt = const Value.absent(),
                required DateTime cachedAt,
                Value<int> rowid = const Value.absent(),
              }) => SurveysCompanion.insert(
                id: id,
                recipientId: recipientId,
                name: name,
                language: language,
                dueAt: dueAt,
                completedAt: completedAt,
                questionnaireJson: questionnaireJson,
                status: status,
                surveyScheduleId: surveyScheduleId,
                dataJson: dataJson,
                accessEmail: accessEmail,
                accessPw: accessPw,
                createdAt: createdAt,
                updatedAt: updatedAt,
                cachedAt: cachedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SurveysTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $SurveysTable,
      Survey,
      $$SurveysTableFilterComposer,
      $$SurveysTableOrderingComposer,
      $$SurveysTableAnnotationComposer,
      $$SurveysTableCreateCompanionBuilder,
      $$SurveysTableUpdateCompanionBuilder,
      (Survey, BaseReferences<_$AppDatabase, $SurveysTable, Survey>),
      Survey,
      PrefetchHooks Function()
    >;
typedef $$UpdateQueueTableCreateCompanionBuilder =
    UpdateQueueCompanion Function({
      Value<int> id,
      required String operationType,
      required String operationPayload,
      required DateTime createdAt,
      Value<int> retryCount,
      Value<String> status,
      Value<String?> error,
    });
typedef $$UpdateQueueTableUpdateCompanionBuilder =
    UpdateQueueCompanion Function({
      Value<int> id,
      Value<String> operationType,
      Value<String> operationPayload,
      Value<DateTime> createdAt,
      Value<int> retryCount,
      Value<String> status,
      Value<String?> error,
    });

class $$UpdateQueueTableFilterComposer
    extends Composer<_$AppDatabase, $UpdateQueueTable> {
  $$UpdateQueueTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get operationType => $composableBuilder(
    column: $table.operationType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get operationPayload => $composableBuilder(
    column: $table.operationPayload,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get error => $composableBuilder(
    column: $table.error,
    builder: (column) => ColumnFilters(column),
  );
}

class $$UpdateQueueTableOrderingComposer
    extends Composer<_$AppDatabase, $UpdateQueueTable> {
  $$UpdateQueueTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get operationType => $composableBuilder(
    column: $table.operationType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get operationPayload => $composableBuilder(
    column: $table.operationPayload,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get error => $composableBuilder(
    column: $table.error,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$UpdateQueueTableAnnotationComposer
    extends Composer<_$AppDatabase, $UpdateQueueTable> {
  $$UpdateQueueTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get operationType => $composableBuilder(
    column: $table.operationType,
    builder: (column) => column,
  );

  GeneratedColumn<String> get operationPayload => $composableBuilder(
    column: $table.operationPayload,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get error =>
      $composableBuilder(column: $table.error, builder: (column) => column);
}

class $$UpdateQueueTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $UpdateQueueTable,
          UpdateQueueData,
          $$UpdateQueueTableFilterComposer,
          $$UpdateQueueTableOrderingComposer,
          $$UpdateQueueTableAnnotationComposer,
          $$UpdateQueueTableCreateCompanionBuilder,
          $$UpdateQueueTableUpdateCompanionBuilder,
          (
            UpdateQueueData,
            BaseReferences<_$AppDatabase, $UpdateQueueTable, UpdateQueueData>,
          ),
          UpdateQueueData,
          PrefetchHooks Function()
        > {
  $$UpdateQueueTableTableManager(_$AppDatabase db, $UpdateQueueTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$UpdateQueueTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$UpdateQueueTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$UpdateQueueTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> operationType = const Value.absent(),
                Value<String> operationPayload = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> retryCount = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> error = const Value.absent(),
              }) => UpdateQueueCompanion(
                id: id,
                operationType: operationType,
                operationPayload: operationPayload,
                createdAt: createdAt,
                retryCount: retryCount,
                status: status,
                error: error,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String operationType,
                required String operationPayload,
                required DateTime createdAt,
                Value<int> retryCount = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> error = const Value.absent(),
              }) => UpdateQueueCompanion.insert(
                id: id,
                operationType: operationType,
                operationPayload: operationPayload,
                createdAt: createdAt,
                retryCount: retryCount,
                status: status,
                error: error,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$UpdateQueueTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $UpdateQueueTable,
      UpdateQueueData,
      $$UpdateQueueTableFilterComposer,
      $$UpdateQueueTableOrderingComposer,
      $$UpdateQueueTableAnnotationComposer,
      $$UpdateQueueTableCreateCompanionBuilder,
      $$UpdateQueueTableUpdateCompanionBuilder,
      (
        UpdateQueueData,
        BaseReferences<_$AppDatabase, $UpdateQueueTable, UpdateQueueData>,
      ),
      UpdateQueueData,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$RecipientsTableTableManager get recipients =>
      $$RecipientsTableTableManager(_db, _db.recipients);
  $$PayoutsTableTableManager get payouts =>
      $$PayoutsTableTableManager(_db, _db.payouts);
  $$SurveysTableTableManager get surveys =>
      $$SurveysTableTableManager(_db, _db.surveys);
  $$UpdateQueueTableTableManager get updateQueue =>
      $$UpdateQueueTableTableManager(_db, _db.updateQueue);
}
