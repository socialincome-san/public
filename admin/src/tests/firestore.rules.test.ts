/**
 * @jest-environment node
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import fs from "fs";
import path from "path";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { AdminUser } from "../app/collections/admins/interface";
import { populateRecipientsCollection } from "./firestore-data/recipients";
import { populateOrganisationsCollection } from "./firestore-data/organisations";
import { populateAdminsCollection } from "./firestore-data/admins";

let testEnvironment: RulesTestEnvironment;
let globalAdminStore: firebase.firestore.Firestore;
let globalAnalystStore: firebase.firestore.Firestore;
let testOrganisationAdminStore: firebase.firestore.Firestore;

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: "test-project",
    firestore: {
      host: "localhost",
      port: 8080,
      rules: fs.readFileSync(path.resolve(__dirname, "firestore.rules"), "utf8"),
    },
  });
  globalAdminStore = testEnvironment
    .authenticatedContext("test_admin", { email: "test_admin@socialincome.org" })
    .firestore();
  globalAnalystStore = testEnvironment
    .authenticatedContext("test_analyst", { email: "test_analyst@socialincome.org" })
    .firestore();
  testOrganisationAdminStore = testEnvironment
    .authenticatedContext("test_organisation_admin", { email: "admin@test-organisation-1.org" })
    .firestore();
});

const setupFireStore = async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await populateOrganisationsCollection(firestore);
    await populateAdminsCollection(firestore);
    await populateRecipientsCollection(firestore);
  });
};

const clearFirestore = async () => {
  await testEnvironment.clearFirestore();
};

describe("Test admins collection", () => {
  beforeEach(setupFireStore);
  afterEach(clearFirestore);

  it("Read admins collection", async () => {
    const testAdminUserDoc = await getDoc(doc(globalAdminStore, "admins", "test_admin@socialincome.org"));
    expect(testAdminUserDoc.exists()).toBe(true);
    const testAdminUser = testAdminUserDoc.data() as AdminUser;
    expect(testAdminUser.name).toBe("Test Admin");
    expect(testAdminUser.organisations).toBeUndefined();

    const testAnalystUserDoc = await getDoc(doc(globalAnalystStore, "admins", "test_analyst@socialincome.org"));
    expect(testAnalystUserDoc.exists()).toBe(true);
    const testAnalystUser = testAnalystUserDoc.data() as AdminUser;
    expect(testAnalystUser.name).toBe("Test Analyst");
    expect(testAdminUser.organisations).toBeUndefined();

    const testOrganisationAdminDoc = await getDoc(
      doc(testOrganisationAdminStore, "admins", "admin@test-organisation-1.org")
    );
    expect(testOrganisationAdminDoc.exists()).toBe(true);
    const testOrganisationAdmin = testOrganisationAdminDoc.data() as AdminUser;
    expect(testOrganisationAdmin.name).toBe("Test Organisation Admin");
    expect(testOrganisationAdmin.organisations).toHaveLength(1);
  });

  it("Write admins collection", async () => {
    await assertSucceeds(
      setDoc(doc(globalAdminStore, "admins", "test_admin2@socialincome.org"), { name: "Test", is_global_admin: true })
    );
    await assertFails(
      setDoc(doc(globalAnalystStore, "admins", "test_admin2@socialincome.org"), { name: "Test", is_global_admin: true })
    );
  });
});

describe("Test organisations collection", () => {
  beforeEach(setupFireStore);
  afterEach(clearFirestore);

  it("Read recipients collection", async () => {
    const organisationDoc = await getDoc(doc(testOrganisationAdminStore, "organisations", "test-organisation-1"));
    expect(organisationDoc.exists()).toBe(true);
  });
});

describe("Test recipients collection", () => {
  beforeEach(setupFireStore);
  afterEach(clearFirestore);

  it("Read single recipients doc", async () => {
    const recipientDoc = await getDoc(doc(testOrganisationAdminStore, "recipients", "P0OHM3bzrT9Kn3je6G55"));
    expect(recipientDoc.exists()).toBe(true);
  });

  it("Read multiple recipients docs", async () => {
    const querySnapshot = await getDocs(
      query(
        collection(testOrganisationAdminStore, "recipients"),
        where("organisation", "==", doc(testOrganisationAdminStore, "organisations", "test-organisation-1"))
      )
    );
    expect(querySnapshot.size).toBe(1);

    await assertFails(
      getDocs(
        query(
          collection(testOrganisationAdminStore, "recipients"),
          where("organisation", "==", doc(testOrganisationAdminStore, "organisations", "test-organisation-2"))
        )
      )
    );
  });

  it("Delete recipients doc", async () => {
    await assertFails(deleteDoc(doc(testOrganisationAdminStore, "recipients", "P0OHM3bzrT9Kn3je6G55")));
  });
});
