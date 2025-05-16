import "package:json_annotation/json_annotation.dart";

class DateTimeConverter implements JsonConverter<DateTime, String> {
  const DateTimeConverter();

  @override
  DateTime fromJson(String json) => DateTime.fromMillisecondsSinceEpoch(int.parse(json));

  @override
  String toJson(DateTime timestamp) => timestamp.millisecondsSinceEpoch.toString();
}
