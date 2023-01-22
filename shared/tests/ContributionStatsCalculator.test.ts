import { describe, expect, test } from '@jest/globals';
import * as admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../src/firebase/FirestoreAdmin';
import {
	ContributionSourceKey,
	CONTRIBUTION_FIRESTORE_PATH,
	StatusKey,
	User,
	UserStatusKey,
	USER_FIRESTORE_PATH,
} from '../src/types';
import { ContributionStatsCalculator } from '../src/utils/stats/ContributionStatsCalculator';
import Timestamp = admin.firestore.Timestamp;

describe('calcFinancialStats', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));
	let calculator: ContributionStatsCalculator;

	beforeAll(async () => {
		await testEnv.firestore.clearFirestoreData({ projectId: projectId });
		await deleteSeedUsers(); // to keep this unit test independent of the seed data for easier maintenance
		await insertTestData();
		calculator = await ContributionStatsCalculator.build(firestoreAdmin);
	});

	test('building ContributionStatsCalculator', async () => {
		expect(calculator.contributions.size()).toEqual(6);
	});

	test('calculate overall contributions', async () => {
		expect(calculator.totalContributionsChf()).toEqual(2400);
	});

	test('calculate overall fees', async () => {
		expect(calculator.totalFeesChf()).toEqual(48);
	});

	test('calculate contributions by currency', async () => {
		expect(calculator.totalContributionsChfByCurrency()).toEqual(
			expect.arrayContaining([
				{ amountChf: 400, currency: 'USD' },
				{ amountChf: 2000, currency: 'CHF' },
			])
		);
	});

	test('calculate contributions by isInstitutuion', async () => {
		expect(calculator.totalContributionsChfByIsInstitution()).toEqual(
			expect.arrayContaining([
				{ amountChf: 400, isInstitution: 'false' },
				{ amountChf: 2000, isInstitution: 'true' },
			])
		);
	});

	test('calculate contributions by country', async () => {
		expect(calculator.totalContributionsChfByCountry()).toEqual(
			expect.arrayContaining([
				{ amountChf: 400, country: 'US' },
				{ amountChf: 2000, country: 'CH' },
			])
		);
	});

	test('calculate contributions by source', async () => {
		expect(calculator.totalContributionsChfBySource()).toEqual(
			expect.arrayContaining([
				{ amountChf: 2000, source: 'benevity' },
				{ amountChf: 400, source: 'stripe' },
			])
		);
	});

	test('calculate contributions by first day in month', async () => {
		expect(calculator.totalContributionsChfByFirstDayInMonth()).toEqual(
			expect.arrayContaining([
				{ amountChf: 1100, firstDayInMonth: '2023-01-01' },
				{ amountChf: 100, firstDayInMonth: '2023-02-01' },
				{ amountChf: 100, firstDayInMonth: '2023-03-01' },
				{ amountChf: 1100, firstDayInMonth: '2023-04-01' },
			])
		);
	});

	const user1: User = {
		personal: {
			name: 'User1',
			lastname: 'User1',
		},
		email: '123@socialincome.org',
		stripe_customer_id: 'cus_123',
		test_user: false,
		status: UserStatusKey.INITIALIZED,
		location: 'US',
		currency: 'USD',
	};
	const contributionsUser1 = ['2023-01-05', '2023-02-05', '2023-03-05', '2023-04-05'].map((date) => {
		return {
			source: ContributionSourceKey.STRIPE,
			created: Timestamp.fromDate(new Date(date)),
			amount: 100,
			currency: 'usd',
			amount_chf: 100,
			fees_chf: 2,
			monthly_interval: 3,
			reference_id: 'ch_123',
			status: StatusKey.SUCCEEDED,
		};
	});

	const user2: User = {
		personal: {
			name: 'User2',
			lastname: 'User2',
		},
		email: '456@socialincome.org',
		stripe_customer_id: 'cus_456',
		test_user: false,
		status: UserStatusKey.INITIALIZED,
		institution: true,
		location: 'ch',
		currency: 'chf',
	};
	const contributionsUser2 = ['2023-01-08', '2023-04-09'].map((date) => {
		return {
			source: ContributionSourceKey.BENEVITY,
			created: Timestamp.fromDate(new Date(date)),
			amount: 1000,
			currency: 'chf',
			amount_chf: 1000,
			fees_chf: 20,
			monthly_interval: 3,
			reference_id: 'ch_456',
			status: StatusKey.SUCCEEDED,
		};
	});

	// this user and the associated contributions should be ignored in the stats
	const testUser: User = {
		personal: {
			name: 'Test User',
			lastname: 'User2',
		},
		email: 'test@socialincome.org',
		stripe_customer_id: 'cus_123',
		test_user: true,
		status: UserStatusKey.INITIALIZED,
		location: 'US',
		currency: 'USD',
	};
	const contributionsTestUser = ['2023-01-05'].map((date) => {
		return {
			source: ContributionSourceKey.STRIPE,
			created: Timestamp.fromDate(new Date(date)),
			amount: 100,
			currency: 'usd',
			amount_chf: 818.68,
			fees_chf: 24.04,
			monthly_interval: 3,
			reference_id: 'ch_test',
			status: StatusKey.SUCCEEDED,
		};
	});

	const insertTestData = async () => {
		const user1Ref = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add(user1);
		await Promise.all(contributionsUser1.map((c) => user1Ref.collection(CONTRIBUTION_FIRESTORE_PATH).add(c)));

		const user2Ref = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add(user2);
		await Promise.all(contributionsUser2.map((c) => user2Ref.collection(CONTRIBUTION_FIRESTORE_PATH).add(c)));

		const testUserRef = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add(testUser);
		await Promise.all(contributionsTestUser.map((c) => testUserRef.collection(CONTRIBUTION_FIRESTORE_PATH).add(c)));
	};

	const deleteSeedUsers = async () => {
		const docs = await firestoreAdmin.collection(USER_FIRESTORE_PATH).listDocuments();
		await Promise.all(
			docs.map(async (doc) => {
				return await doc.delete();
			})
		);
	};
});
