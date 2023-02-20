import "dart:convert";

import "package:equatable/equatable.dart";

class Phone extends Equatable {
  final int phoneNumber;

  const Phone(this.phoneNumber);

  factory Phone.fromMap(Map<String, dynamic> map) {
    return Phone(
      map["phone"] as int,
    );
  }

  factory Phone.fromJson(String source) =>
      Phone.fromMap(json.decode(source) as Map<String, dynamic>);

  Map<String, dynamic> toMap() {
    final result = <String, dynamic>{};

    result.addAll({"phone": phoneNumber});

    return result;
  }

  @override
  List<Object?> get props => [phoneNumber];
}
