import { describe, expect, test } from "@jest/globals";
import firebaseFunctionsTest from "firebase-functions-test";
import * as bankBalance from "../../src/interfaces/collections/bankBalances";
import { createDoc } from "../../src/useFirestoreAdmin";
import * as importPostfinanceBalance from "../../src/etl/importPostfinanceBalance";

const { cleanup } = firebaseFunctionsTest();

describe("importPostfinanceBalance", () => {
  afterAll(() => cleanup());
  test("inserts balanes into firestore", async () => {
    const balances = [
      {
        timestamp: 1663339392,
        account: "testAccount",
        balance: 1000,
        currency: "CHF",
      } as bankBalance.BankBalance,
    ];

    await importPostfinanceBalance.storeBalances(balances);

    const balance = balances[0];
    const snap = await createDoc<bankBalance.BankBalance>(bankBalance.path, bankBalance.id(balance)).get();
    expect(balance).toEqual(snap.data());
  });
  jest.setTimeout(30000);
});
