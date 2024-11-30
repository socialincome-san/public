import "package:cloud_firestore/cloud_firestore.dart";

// ignore: subtype_of_sealed_class
class NoOpDocumentReference implements DocumentReference<Map<String, dynamic>> {
  const NoOpDocumentReference();

  @override
  CollectionReference<Map<String, dynamic>> collection(String collectionPath) {
    // TODO: implement collection
    throw UnimplementedError();
  }

  @override
  Future<void> delete() {
    // TODO: implement delete
    throw UnimplementedError();
  }

  @override
  // TODO: implement firestore
  FirebaseFirestore get firestore => throw UnimplementedError();

  @override
  Future<DocumentSnapshot<Map<String, dynamic>>> get([GetOptions? options]) {
    // TODO: implement get
    throw UnimplementedError();
  }

  @override
  // TODO: implement id
  String get id => throw UnimplementedError();

  @override
  // TODO: implement parent
  CollectionReference<Map<String, dynamic>> get parent => throw UnimplementedError();

  @override
  // TODO: implement path
  String get path => throw UnimplementedError();

  @override
  Future<void> set(Map<String, dynamic> data, [SetOptions? options]) {
    // TODO: implement set
    throw UnimplementedError();
  }

  @override
  Stream<DocumentSnapshot<Map<String, dynamic>>> snapshots(
      {bool includeMetadataChanges = false, ListenSource source = ListenSource.defaultSource,}) {
    // TODO: implement snapshots
    throw UnimplementedError();
  }

  @override
  Future<void> update(Map<Object, Object?> data) {
    // TODO: implement update
    throw UnimplementedError();
  }

  @override
  DocumentReference<R> withConverter<R>(
      {required FromFirestore<R> fromFirestore, required ToFirestore<R> toFirestore,}) {
    // TODO: implement withConverter
    throw UnimplementedError();
  }
}
