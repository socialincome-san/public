import "package:app/data/datasource/organization_data_source.dart";
import "package:app/data/models/organization.dart";
import "package:cloud_firestore/cloud_firestore.dart";

const String surveyCollection = "surveys";

class OrganizationRemoteDataSource implements OrganizationDataSource {
  final FirebaseFirestore firestore;

  const OrganizationRemoteDataSource({
    required this.firestore,
  });

  @override
  Future<Organization?> fetchOrganization(
    DocumentReference organizationRef,
  ) async {
    final organization = organizationRef.withConverter(
      fromFirestore: (snapshot, _) {
        final data = snapshot.data()!;
        return Organization.fromJson(data);
      },
      toFirestore: (organization, _) => organization.toJson(),
    );

    return (await organization.get()).data();
  }
}
