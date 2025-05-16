import "package:app/data/datasource/organization_data_source.dart";
import "package:app/data/models/organization.dart";
import "package:app/demo_manager.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class OrganizationRepository {
  final OrganizationDataSource remoteDataSource;
  final OrganizationDataSource demoDataSource;

  final DemoManager demoManager;

  const OrganizationRepository({
    required this.demoManager,
    required this.remoteDataSource,
    required this.demoDataSource,
  });

  OrganizationDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Future<Organization?> fetchOrganization(DocumentReference organizationRef) {
    return _activeDataSource.fetchOrganization(organizationRef);
  }
}
