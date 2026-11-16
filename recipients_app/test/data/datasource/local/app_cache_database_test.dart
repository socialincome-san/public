import "package:app/data/datasource/local/app_cache_database.dart";
import "package:drift/native.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  late AppCacheDatabase database;

  setUp(() {
    database = AppCacheDatabase(NativeDatabase.memory());
  });

  tearDown(() async {
    await database.close();
  });

  test("put stores and overwrites an entry", () async {
    await database.put("payouts", "first");
    await database.put("payouts", "second");

    expect(await database.get("payouts"), "second");
  });

  test("put does not throw when the database rejects the write", () async {
    await database.put("payouts", "cached");
    await database.customStatement("PRAGMA query_only = ON");

    await expectLater(database.put("payouts", "fresh"), completes);

    expect(await database.get("payouts"), "cached");
  });
}
