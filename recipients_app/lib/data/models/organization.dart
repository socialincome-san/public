import "package:equatable/equatable.dart";
import "package:json_annotation/json_annotation.dart";

part "organization.g.dart";

@JsonSerializable()
class Organization extends Equatable {
  final String name;
  final String? contactName;
  final String? contactNumber;

  const Organization({required this.name, this.contactName, this.contactNumber});

  @override
  List<Object?> get props => [name, contactName, contactNumber];

  factory Organization.fromJson(Map<String, dynamic> json) => _$OrganizationFromJson(json);

  Map<String, dynamic> toJson() => _$OrganizationToJson(this);
}
