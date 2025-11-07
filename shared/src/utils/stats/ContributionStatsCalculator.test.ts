import { expect, test } from '@jest/globals';
import functions from 'firebase-functions-test';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../../firebase/admin/app';
import { toFirebaseAdminTimestamp } from '../../firebase/admin/utils';
import { CONTRIBUTION_FIRESTORE_PATH, ContributionSourceKey, StatusKey } from '../../types/contribution';
import { User, USER_FIRESTORE_PATH } from '../../types/user';
import { ContributionStatsCalculator } from './ContributionStatsCalculator';

const projectId = 'contribution-stats-calculator-test';
const testEnv = functions({ projectId: projectId });
const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));
let calculator: ContributionStatsCalculator;

beforeAll(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId: projectId });
	await insertTestData();
	calculator = await ContributionStatsCalculator.build(firestoreAdmin, 'CHF');
});

test('building ContributionStatsCalculator', async () => {
	expect(calculator.contributions.size()).toEqual(6);
});

test('calculate overall contributions', async () => {
	expect(calculator.totalContributionsAmount()).toEqual(2400);
});

test('calculate contributions by currency', async () => {
	expect(calculator.totalContributionsByCurrency()).toEqual(
		expect.arrayContaining([
			{ amount: 400, currency: 'USD', usersCount: 1 },
			{ amount: 2000, currency: 'CHF', usersCount: 1 },
		]),
	);
});

test('calculate contributions by isInstitutuion', async () => {
	expect(calculator.totalContributionsByIsInstitution()).toEqual(
		expect.arrayContaining([
			{ amount: 400, isInstitution: 'false', usersCount: 1 },
			{ amount: 2000, isInstitution: 'true', usersCount: 1 },
		]),
	);
});

test('calculate contributions by country', async () => {
	expect(calculator.totalContributionsByCountry()).toEqual(
		expect.arrayContaining([
			{ amount: 400, country: 'US', usersCount: 1 },
			{ amount: 2000, country: 'CH', usersCount: 1 },
		]),
	);
});

test('calculate contributions by source', async () => {
	expect(calculator.totalContributionsBySource()).toEqual(
		expect.arrayContaining([
			{ amount: 2000, source: 'benevity', usersCount: 1 },
			{ amount: 400, source: 'stripe', usersCount: 1 },
		]),
	);
});

test('calculate contributions by first day in month', async () => {
	expect(calculator.totalContributionsByMonth()).toEqual(
		expect.arrayContaining([
			{ amount: 1100, month: '2023-01', usersCount: 2 },
			{ amount: 100, month: '2023-02', usersCount: 1 },
			{ amount: 100, month: '2023-03', usersCount: 1 },
			{ amount: 1100, month: '2023-04', usersCount: 2 },
		]),
	);
});

const user1: User = {
	personal: {
		name: 'User1',
		lastname: 'User1',
	},
	address: {
		country: 'US',
	},
	email: '123@socialincome.org',
	stripe_customer_id: 'cus_123',
	payment_reference_id: DateTime.now().toMillis(),
	test_user: false,
	currency: 'USD',
	created_at: toFirebaseAdminTimestamp(new Date('2023-01-01')),
	last_updated_at: toFirebaseAdminTimestamp(new Date('2023-02-01')),
};
const contributionsUser1 = ['2023-01-05', '2023-02-05', '2023-03-05', '2023-04-05'].map((date) => {
	return {
		source: ContributionSourceKey.STRIPE,
		created: toFirebaseAdminTimestamp(new Date(date)),
		amount: 100,
		currency: 'USD',
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
	address: {
		country: 'CH',
	},
	email: '456@socialincome.org',
	stripe_customer_id: 'cus_456',
	payment_reference_id: DateTime.now().toMillis(),
	test_user: false,
	institution: true,
	currency: 'CHF',
	created_at: toFirebaseAdminTimestamp(new Date('2023-02-01')),
	last_updated_at: toFirebaseAdminTimestamp(new Date('2023-03-01')),
};
const contributionsUser2 = ['2023-01-08', '2023-04-09'].map((date) => {
	return {
		source: ContributionSourceKey.BENEVITY,
		created: toFirebaseAdminTimestamp(new Date(date)),
		amount: 1000,
		currency: 'CHF',
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
	address: {
		country: 'US',
	},
	email: 'test@socialincome.org',
	stripe_customer_id: 'cus_124',
	payment_reference_id: DateTime.now().toMillis(),
	test_user: true,
	currency: 'USD',
	created_at: toFirebaseAdminTimestamp(new Date('2023-03-01')),
	last_updated_at: toFirebaseAdminTimestamp(new Date('2023-04-01')),
};
const contributionsTestUser = ['2023-01-05'].map((date) => {
	return {
		source: ContributionSourceKey.STRIPE,
		created: toFirebaseAdminTimestamp(new Date(date)),
		amount: 100,
		currency: 'USD',
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
