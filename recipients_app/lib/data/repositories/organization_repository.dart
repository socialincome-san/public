import "package:app/data/models/organization.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class OrganizationRepository {
  final FirebaseFirestore firestore;

  const OrganizationRepository({
    required this.firestore,
  });

  Future<Organization?> fetchOrganization(
    DocumentReference organizationRef,
  ) async {
    final organization = await organizationRef.withConverter(
      fromFirestore: (snapshot, _) {
        final data = snapshot.data()!;
        return Organization.fromMap(data);
      },
      toFirestore: (organization, _) => organization.toMap(),
    );

    return (await organization.get()).data();
  }
}
