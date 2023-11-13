import "package:equatable/equatable.dart";
import "package:json_annotation/json_annotation.dart";

part "phone.g.dart";

@JsonSerializable()
class Phone extends Equatable {
  @JsonKey(name: "phone", defaultValue: 0)
  final int phoneNumber;

  const Phone(this.phoneNumber);

  factory Phone.fromJson(Map<String, dynamic> json) => _$PhoneFromJson(json);
  Map<String, dynamic> toJson() => _$PhoneToJson(this);

  @override
  List<Object?> get props => [phoneNumber];
}
