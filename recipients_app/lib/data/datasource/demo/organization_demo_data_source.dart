import "package:app/data/datasource/organization_data_source.dart";
import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class OrganizationDemoDataSource implements OrganizationDataSource {
  final Organization _organization = _generateOrganization();

  static Organization _generateOrganization() {
    return const Organization(name: "Demo organization", contactName: "Demo manager", contactNumber: "+232 123456789");
  }

  @override
  Future<Organization?> fetchOrganization(DocumentReference<Object?> organizationRef) async {
    return _organization;
  }
}
