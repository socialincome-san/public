import "package:app/data/datasource/demo/payment_demo_data_source.dart";
import "package:app/data/datasource/payment_data_source.dart";
import "package:app/data/datasource/remote/payment_remote_data_source.dart";
import "package:app/data/models/models.dart";
import "package:cloud_firestore/cloud_firestore.dart";

class PaymentRepository {
  late PaymentDataSource remoteDataSource = PaymentRemoteDataSource(firestore: firestore);
  late PaymentDataSource demoDataSource = PaymentDemoDataSource();

  final bool useRemoteDataSource;
  final FirebaseFirestore firestore;

  PaymentRepository({
    required this.firestore,
    this.useRemoteDataSource = false,
  });

  PaymentDataSource get _activeDataSource => useRemoteDataSource ? remoteDataSource : demoDataSource;

  Future<List<SocialIncomePayment>> fetchPayments({
    required String recipientId,
  }) async {
    return _activeDataSource.fetchPayments(recipientId: recipientId);
  }

  Future<void> confirmPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
  }) async {
    await _activeDataSource.confirmPayment(
      recipient: recipient,
      payment: payment,
    );
  }

  Future<void> contestPayment({
    required Recipient recipient,
    required SocialIncomePayment payment,
    required String contestReason,
  }) async {
    await _activeDataSource.contestPayment(
      recipient: recipient,
      payment: payment,
      contestReason: contestReason,
    );
  }
}
