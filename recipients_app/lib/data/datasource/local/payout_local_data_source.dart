import "package:app/data/database/app_database.dart" as db;
import "package:app/data/datasource/payout_data_source.dart";
import "package:app/data/enums/payout_status.dart";
import "package:app/data/models/currency.dart";
import "package:app/data/models/payment/payout.dart";
import "package:drift/drift.dart";

class PayoutLocalDataSource implements PayoutDataSource {
  final db.AppDatabase database;

  PayoutLocalDataSource({required this.database});

  @override
  Future<List<Payout>> fetchPayouts() async {
    final payoutRows = await database.select(database.payouts).get();

    return payoutRows.map((row) {
      return Payout(
        id: row.id,
        amount: row.amount,
        amountChf: row.amountChf,
        currency: CurrencyMapper.fromValue(row.currency),
        paymentAt: row.paymentAt,
        status: PayoutStatusMapper.fromValue(row.status),
        phoneNumber: row.phoneNumber,
        comments: row.comments,
        recipientId: row.recipientId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      );
    }).toList();
  }

  Future<void> savePayouts(List<Payout> payouts) async {
    await database.batch((batch) {
      batch.deleteAll(database.payouts); // Clear old data

      for (final payout in payouts) {
        batch.insert(
          database.payouts,
          db.PayoutsCompanion.insert(
            id: payout.id,
            recipientId: payout.recipientId,
            amount: payout.amount,
            amountChf: Value(payout.amountChf),
            currency: payout.currency.toValue() as String,
            paymentAt: payout.paymentAt,
            status: payout.status.toValue(),
            phoneNumber: Value(payout.phoneNumber),
            comments: Value(payout.comments),
            createdAt: payout.createdAt,
            updatedAt: Value(payout.updatedAt),
            cachedAt: DateTime.now(),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  Future<void> clearPayouts() async {
    await database.delete(database.payouts).go();
  }

  @override
  Future<void> confirmPayout({required String payoutId}) async {
    await (database.update(database.payouts)..where((p) => p.id.equals(payoutId))).write(
      db.PayoutsCompanion(status: Value(PayoutStatus.confirmed.toValue())),
    );
  }

  @override
  Future<void> contestPayout({required String payoutId, required String contestReason}) async {
    await (database.update(database.payouts)..where((p) => p.id.equals(payoutId))).write(
      db.PayoutsCompanion(status: Value(PayoutStatus.contested.toValue()), comments: Value(contestReason)),
    );
  }
}
