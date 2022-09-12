import { describe, expect, test } from "@jest/globals";

const firebaseTest = require("firebase-functions-test")();
const admin = require("firebase-admin");

const myFunctions = require("../src");

describe("index", () => {
  afterAll(() => firebaseTest.cleanup());
  test("handles simple http request", async () => {
    const req = { query: { text: "input" } };

    const sendPromise = new Promise((resolve) => {
      // A fake response object, with a stubbed send() function which asserts that it is called
      // with the right result
      const res = {
        send: (text: String) => {
          resolve(text);
        },
      };

      // Invoke function with our fake request and response objects.
      myFunctions.simpleHttp(req, res);
    });

    // Wait for the promise to be resolved and then check the sent text
    const text = await sendPromise;
    expect(text).toBe(`text: input`);
  });

  test("tests a Cloud Firestore function", async () => {
    const wrapped = firebaseTest.wrap(myFunctions.firestoreUppercase);

    // Make a fake document snapshot to pass to the function
    const after = firebaseTest.firestore.makeDocumentSnapshot(
      {
        text: "hello world",
      },
      "/lowercase/foo"
    );

    // Call the function
    await wrapped(after);

    // Check the data in the Firestore emulator
    const snap = await admin.firestore().doc("/uppercase/foo").get();
    expect(snap.data()).toStrictEqual({
      text: "HELLO WORLD",
    });
  });
  jest.setTimeout(30000);
});
