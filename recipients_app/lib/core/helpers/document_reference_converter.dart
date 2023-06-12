import "package:cloud_firestore/cloud_firestore.dart";
import "package:json_annotation/json_annotation.dart";

class DocumentReferenceConverter
    implements JsonConverter<DocumentReference, dynamic> {
  const DocumentReferenceConverter();

  @override
  DocumentReference fromJson(dynamic json) => json as DocumentReference;

  @override
  dynamic toJson(DocumentReference documentReference) => documentReference;
}
