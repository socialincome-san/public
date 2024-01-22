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
import { AdminUser } from '../src/types/admin-user';
import { USER_FIRESTORE_PATH } from '../src/types/user';

let testEnvironment: RulesTestEnvironment;
let globalAdminStore: firebase.firestore.Firestore;
let globalAnalystStore: firebase.firestore.Firestore;
let recipientAppAccess: firebase.firestore.Firestore;
let userAppAccess: firebase.firestore.Firestore;

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
	userAppAccess = testEnvironment
		.authenticatedContext('w43IydQbr8lgeGeevbSBoP9ui3WQ', { email: 'test@test.org' })
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
			}),
		);
		await assertFails(
			setDoc(doc(globalAnalystStore, 'admins', 'admin3@socialincome.org'), {
				name: 'Test',
				is_global_admin: true,
			}),
		);
	});
});

describe('Test recipients collection', () => {
	it('Read recipients doc', async () => {
		const recipients = await getDocs(query(collection(globalAdminStore, 'recipients')));
		expect(recipients.size).toBe(6);

		const phoneNumberAccessDoc = await getDoc(doc(recipientAppAccess, 'recipients', 'iF8bLEoUjqOIlq84XQmi'));
		expect(phoneNumberAccessDoc.exists()).toBe(true);

		await assertFails(getDoc(doc(recipientAppAccess, 'recipients', 'z9zBQaDI8GB8tZ36HwDE')));
	});

	it('Read payments subcollection', async () => {
		// Access as organisation admin
		const globalAdminDocs = await getDocs(
			query(collection(globalAdminStore, 'recipients', 'z9zBQaDI8GB8tZ36HwDE', 'payments')),
		);
		expect(globalAdminDocs.size).toBe(7);

		// Access through phone number
		const phoneNumberAccessDocs = await getDocs(
			query(collection(recipientAppAccess, 'recipients', 'iF8bLEoUjqOIlq84XQmi', 'payments')),
		);
		expect(phoneNumberAccessDocs.size).toBe(7);

		// Phone number mismatch
		await assertFails(getDocs(query(collection(recipientAppAccess, 'recipients', 'z9zBQaDI8GB8tZ36HwDE', 'payments'))));
	});
});

describe('Test user access', () => {
	it('Read user doc', async () => {
		// Access own user document
		const userDocsAllowed = await getDoc(doc(userAppAccess, USER_FIRESTORE_PATH, 'cCj3O9gQuopmPZ15JTI0'));
		expect(userDocsAllowed.exists()).toBe(true);
		expect(userDocsAllowed.get('auth_user_id')).toBe('w43IydQbr8lgeGeevbSBoP9ui3WQ');

		// Access other user document (not allowed)
		await assertFails(getDoc(doc(userAppAccess, USER_FIRESTORE_PATH, 'EgDWTYqz7zNyQ4CdxieW')));
	});
});

afterAll(async () => {
	await testEnvironment.cleanup();
});
