import "dart:convert";

import "package:equatable/equatable.dart";

class Organization extends Equatable {
  final String name;
  final String? contactName;
  final String? contactNumber;

  const Organization({
    required this.name,
    this.contactName,
    this.contactNumber,
  });

  @override
  List<Object?> get props => [name, contactName, contactNumber];

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    result.addAll({"name": name});
    if (contactName != null) {
      result.addAll({"contactName": contactName});
    }
    if (contactNumber != null) {
      result.addAll({"contactNumber": contactNumber});
    }

    return result;
  }

  factory Organization.fromMap(Map<String, dynamic> map) {
    return Organization(
      name: map["name"] as String,
      contactName: map["contactName"] as String?,
      contactNumber: map["contactNumber"] as String?,
    );
  }

  String toJson() => json.encode(toMap());

  factory Organization.fromJson(String source) =>
      Organization.fromMap(json.decode(source) as Map<String, dynamic>);
}
