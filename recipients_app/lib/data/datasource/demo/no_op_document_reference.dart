import "package:cloud_firestore/cloud_firestore.dart";

// We are using DocumentReference in repository / data source. That's why we need to get 
// no-op implementation for it for demo data source.

// NoOpDocumentReference is a no-op implementation of DocumentReference.
// ignore: subtype_of_sealed_class
class NoOpDocumentReference implements DocumentReference<Map<String, dynamic>> {
  const NoOpDocumentReference();

  @override
  CollectionReference<Map<String, dynamic>> collection(String collectionPath) {
    throw UnimplementedError();
  }

  @override
  Future<void> delete() {
    throw UnimplementedError();
  }

  @override
  FirebaseFirestore get firestore => throw UnimplementedError();

  @override
  Future<DocumentSnapshot<Map<String, dynamic>>> get([GetOptions? options]) {
    throw UnimplementedError();
  }

  @override
  String get id => throw UnimplementedError();

  @override
  CollectionReference<Map<String, dynamic>> get parent => throw UnimplementedError();

  @override
  String get path => throw UnimplementedError();

  @override
  Future<void> set(Map<String, dynamic> data, [SetOptions? options]) {
    throw UnimplementedError();
  }

  @override
  Stream<DocumentSnapshot<Map<String, dynamic>>> snapshots(
      {bool includeMetadataChanges = false, ListenSource source = ListenSource.defaultSource,}) {
    throw UnimplementedError();
  }

  @override
  Future<void> update(Map<Object, Object?> data) {
    throw UnimplementedError();
  }

  @override
  DocumentReference<R> withConverter<R>(
      {required FromFirestore<R> fromFirestore, required ToFirestore<R> toFirestore,}) {
    throw UnimplementedError();
  }
}
