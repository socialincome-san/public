import "package:app/data/datasource/payment_data_source.dart";
import "package:app/data/models/models.dart";
import "package:app/demo_manager.dart";

class PaymentRepository {
  final PaymentDataSource remoteDataSource;
  final PaymentDataSource demoDataSource;

  final DemoManager demoManager;

  const PaymentRepository({
    required this.remoteDataSource,
    required this.demoDataSource,
    required this.demoManager,
  });

  PaymentDataSource get _activeDataSource => demoManager.isDemoEnabled ? demoDataSource : remoteDataSource;

  Future<List<SocialIncomePayment>> fetchPayments({
    required String recipientId,
  }) {
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
