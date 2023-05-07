import "dart:convert";

import "package:cloud_firestore/cloud_firestore.dart";
import "package:collection/collection.dart";
import "package:equatable/equatable.dart";

class Survey extends Equatable {
  final String id;
  final SurveyServerStatus? status;
  final Timestamp? dueDateAt;
  final String? accessEmail;
  final String? accessPassword;

  const Survey({
    required this.id,
    this.status,
    this.dueDateAt,
    this.accessEmail,
    this.accessPassword,
  });

  @override
  List<Object?> get props {
    return [
      id,
      status,
      dueDateAt,
      accessEmail,
      accessPassword,
    ];
  }

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    if (status != null) {
      result.addAll({"status": status?.firebaseName});
    }
    if (dueDateAt != null) {
      result.addAll({"due_date_at": dueDateAt});
    }
    if (accessEmail != null) {
      result.addAll({"access_email": accessEmail});
    }
    if (accessPassword != null) {
      result.addAll({"access_pw": accessPassword});
    }

    return result;
  }

  String toJson() => json.encode(toMap());

  factory Survey.fromMap(String id, Map<String, dynamic> map) {


    return Survey(
      id: id,
      status: map["status"] != null
          ? SurveyServerStatus.values.singleWhereOrNull(
              (element) => element.firebaseName == map["status"],
            )
          : null,
      dueDateAt:
          map["due_date_at"] != null ? map["due_date_at"] as Timestamp : null,
      accessEmail: map["access_email"] as String?,
      accessPassword: map["access_pw"] as String?,
    );
  }

  Survey copyWith({
    String? id,
    SurveyServerStatus? status,
    Timestamp? dueDateAt,
    String? accessEmail,
    String? accessPassword,
  }) {
    return Survey(
      id: id ?? this.id,
      status: status ?? this.status,
      dueDateAt: dueDateAt ?? this.dueDateAt,
      accessEmail: accessEmail ?? this.accessEmail,
      accessPassword: accessPassword ?? this.accessPassword,
    );
  }
}

enum SurveyServerStatus {
  created(firebaseName: "new"),
  sent(firebaseName: "sent"),
  scheduled(firebaseName: "scheduled"),
  inProgress(firebaseName: "in-progress"),
  completed(firebaseName: "completed"),
  missed(firebaseName: "missed");

  const SurveyServerStatus({
    required this.firebaseName,
  });

  final String firebaseName;
}
