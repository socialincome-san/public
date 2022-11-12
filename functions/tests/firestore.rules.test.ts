import {
	assertFails,
	assertSucceeds,
	initializeTestEnvironment,
	RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, expect } from '@jest/globals';
import firebase from 'firebase/compat/app';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { AdminUser } from '../../shared/types';

let testEnvironment: RulesTestEnvironment;
let globalAdminStore: firebase.firestore.Firestore;
let globalAnalystStore: firebase.firestore.Firestore;
let testOrganisationAdminStore: firebase.firestore.Firestore;

beforeAll(async () => {
	testEnvironment = await initializeTestEnvironment({
		projectId: 'social-income-prod',
		firestore: {
			rules: fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8'),
			host: 'localhost',
			port: 8080,
		},
	});
	globalAdminStore = testEnvironment
		.authenticatedContext('Lk6iS7tIuxtl4jZXYeu9DW3PX68Y', { email: 'admin@socialincome.org' })
		.firestore();
	globalAnalystStore = testEnvironment
		.authenticatedContext('test_analyst', { email: 'analyst@socialincome.org' })
		.firestore();
	testOrganisationAdminStore = testEnvironment
		.authenticatedContext('ashoka_admin', { email: 'admin@ashoka.org' })
		.firestore();
});

describe('Test admins collection', () => {
	it('Read admins collection', async () => {
		const testAdminUserDoc = await getDoc(doc(globalAdminStore, 'admins', 'admin@socialincome.org'));
		expect(testAdminUserDoc.exists()).toBe(true);
		const testAdminUser = testAdminUserDoc.data() as AdminUser;
		expect(testAdminUser.name).toBe('Admin');
		expect(testAdminUser.organisations).toBeUndefined();

		const testAnalystUserDoc = await getDoc(doc(globalAnalystStore, 'admins', 'analyst@socialincome.org'));
		expect(testAnalystUserDoc.exists()).toBe(true);
		const testAnalystUser = testAnalystUserDoc.data() as AdminUser;
		expect(testAnalystUser.name).toBe('Test Analyst');
		expect(testAdminUser.organisations).toBeUndefined();

		const testOrganisationAdminDoc = await getDoc(doc(testOrganisationAdminStore, 'admins', 'admin@ashoka.org'));
		expect(testOrganisationAdminDoc.exists()).toBe(true);
		const testOrganisationAdmin = testOrganisationAdminDoc.data() as AdminUser;
		expect(testOrganisationAdmin.name).toBe('Ashoka Admin');
		expect(testOrganisationAdmin.organisations).toHaveLength(1);
	});

	it('Write admins collection', async () => {
		await assertSucceeds(
			setDoc(doc(globalAdminStore, 'admins', 'admin2@socialincome.org'), {
				name: 'Test',
				is_global_admin: true,
			})
		);
		await assertFails(
			setDoc(doc(globalAnalystStore, 'admins', 'admin3@socialincome.org'), {
				name: 'Test',
				is_global_admin: true,
			})
		);
	});
});

describe('Test organisations collection', () => {
	it('Read recipients collection', async () => {
		const organisationDoc = await getDoc(doc(testOrganisationAdminStore, 'organisations', 'ashoka'));
		expect(organisationDoc.exists()).toBe(true);
	});
});

describe('Test recipients collection', () => {
	it('Read single recipients doc', async () => {
		const recipientDoc = await getDoc(doc(testOrganisationAdminStore, 'recipients', '3RqjohcNgUXaejFC7av8'));
		expect(recipientDoc.exists()).toBe(true);
	});

	it('Read multiple recipients docs', async () => {
		const querySnapshot = await getDocs(
			query(
				collection(testOrganisationAdminStore, 'recipients'),
				where('organisation', '==', doc(testOrganisationAdminStore, 'organisations', 'ashoka'))
			)
		);
		expect(querySnapshot.size).toBe(1);
		await assertFails(
			getDocs(
				query(
					collection(testOrganisationAdminStore, 'recipients'),
					where('organisation', '==', doc(testOrganisationAdminStore, 'organisations', 'oxfam'))
				)
			)
		);
	});

	it('Delete recipients doc', async () => {
		await assertFails(deleteDoc(doc(testOrganisationAdminStore, 'recipients', 'P0OHM3bzrT9Kn3je6G55')));
	});
});

afterAll(async () => {
	await testEnvironment.cleanup();
});
