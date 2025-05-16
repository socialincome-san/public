// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'organization.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Organization _$OrganizationFromJson(Map<String, dynamic> json) => Organization(
  name: json['name'] as String,
  contactName: json['contactName'] as String?,
  contactNumber: json['contactNumber'] as String?,
);

Map<String, dynamic> _$OrganizationToJson(Organization instance) => <String, dynamic>{
  'name': instance.name,
  'contactName': instance.contactName,
  'contactNumber': instance.contactNumber,
};
