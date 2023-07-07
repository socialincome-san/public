import {
	assertFails,
	assertSucceeds,
	initializeTestEnvironment,
	RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { describe, expect } from '@jest/globals';
import firebase from 'firebase/compat/app';
import { collection, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { AdminUser } from '../src/types';

let testEnvironment: RulesTestEnvironment;
let globalAdminStore: firebase.firestore.Firestore;
let globalAnalystStore: firebase.firestore.Firestore;
let recipientAppAccess: firebase.firestore.Firestore;

beforeAll(async () => {
	testEnvironment = await initializeTestEnvironment({
		projectId: 'firebase-rules-test',
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
	recipientAppAccess = testEnvironment
		.authenticatedContext('recipient_app', { phone_number: '+23225000501' })
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

describe('Test recipients collection', () => {
	it('Read recipients doc', async () => {
		const recipients = await getDocs(query(collection(globalAdminStore, 'recipients')));
		expect(recipients.size).toBe(5);

		const phoneNumberAccessDoc = await getDoc(doc(recipientAppAccess, 'recipients', 'iF8bLEoUjqOIlq84XQmi'));
		expect(phoneNumberAccessDoc.exists()).toBe(true);

		await assertFails(getDoc(doc(recipientAppAccess, 'recipients', 'z9zBQaDI8GB8tZ36HwDE')));
	});

	it('Read payments subcollection', async () => {
		// Access as organisation admin
		const globalAdminDocs = await getDocs(
			query(collection(globalAdminStore, 'recipients', 'z9zBQaDI8GB8tZ36HwDE', 'payments'))
		);
		expect(globalAdminDocs.size).toBe(2);

		// Access through phone number
		const phoneNumberAccessDocs = await getDocs(
			query(collection(recipientAppAccess, 'recipients', 'iF8bLEoUjqOIlq84XQmi', 'payments'))
		);
		expect(phoneNumberAccessDocs.size).toBe(2);

		// Phone number mismatch
		await assertFails(getDocs(query(collection(recipientAppAccess, 'recipients', 'z9zBQaDI8GB8tZ36HwDE', 'payments'))));
	});
});

afterAll(async () => {
	await testEnvironment.cleanup();
});
