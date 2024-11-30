import "package:app/data/datasource/demo/organization_demo_data_source.dart";
import "package:app/data/datasource/organization_data_source.dart";
import "package:app/data/datasource/remote/organization_remote_data_source.dart";
import "package:app/data/models/organization.dart";
import "package:app/demo_manager.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class OrganizationRepository {
  late OrganizationDataSource remoteDataSource = OrganizationRemoteDataSource(firestore: firestore);
  late OrganizationDataSource demoDataSource = OrganizationDemoDataSource();

  final DemoManager demoManager;
  final FirebaseFirestore firestore;

  OrganizationRepository({
    required this.firestore,
    required this.demoManager,
  });

  OrganizationDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Future<Organization?> fetchOrganization(
    DocumentReference organizationRef,
  ) async {
    return _activeDataSource.fetchOrganization(organizationRef);
  }
}
