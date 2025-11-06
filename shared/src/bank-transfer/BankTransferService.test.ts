import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { UserMetadata, UserRecord } from 'firebase-admin/auth';
import { DateTime } from 'luxon';
import { clearFirestoreData } from '../../tests/utils';
import { AuthAdmin } from '../firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../firebase/admin/FirestoreAdmin';
import { getOrInitializeFirebaseAdmin } from '../firebase/admin/app';
import { toFirebaseAdminTimestamp } from '../firebase/admin/utils';
import {
	BankWireContribution,
	CONTRIBUTION_FIRESTORE_PATH,
	ContributionSourceKey,
	StatusKey,
} from '../types/contribution';
import { Currency } from '../types/currency';
import { User, USER_FIRESTORE_PATH } from '../types/user';
import { BankTransferPayment, BankTransferService, BankTransferUser } from './BankTransferService';

// Mock AuthAdmin
jest.mock('../firebase/admin/AuthAdmin');

describe('BankTransferService', () => {
	const projectId = 'test-' + new Date().getTime();
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId: projectId }));
	const bankTransferService = new BankTransferService(firestoreAdmin);

	// Mock user data
	const testUser: BankTransferUser = {
		email: 'test@socialincome.org',
		firstName: 'Test',
		lastName: 'User',
		paymentReferenceId: 1234567890123,
	};

	const testPayment: BankTransferPayment = {
		amount: 1000,
		intervalCount: 1,
		currency: 'CHF' as Currency,
		recurring: true,
	};

	const mockUserRecord: UserRecord = {
		uid: 'test-auth-uid',
		email: 'test@socialincome.org',
		displayName: 'Test User',
		emailVerified: false,
		disabled: false,
		metadata: {
			creationTime: '2023-01-01T00:00:00.000Z',
			lastSignInTime: '2023-01-01T00:00:00.000Z',
			lastRefreshTime: '2023-01-01T00:00:00.000Z',
			toJSON: () => ({}),
		} as UserMetadata,
		providerData: [],
		toJSON: () => ({}),
	};

	beforeEach(async () => {
		await clearFirestoreData(firestoreAdmin);
		jest.clearAllMocks();
	});

	test('storeCharge creates contribution with correct structure', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		const ref = await bankTransferService.storeCharge(testPayment, testUser);
		const contribution = await ref.get();

		expect(contribution.exists).toBe(true);
		expect(contribution.data()).toMatchObject({
			source: ContributionSourceKey.WIRE_TRANSFER,
			amount: 1000,
			currency: 'CHF',
			amount_chf: 1000,
			fees_chf: 0,
			status: StatusKey.PENDING,
			monthly_interval: 1,
		});
	});

	test('storeCharge creates user in Firestore when user does not exist', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		await bankTransferService.storeCharge(testPayment, testUser);

		// Verify user was created in Firestore
		const userQuery = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (col) =>
			col.where('payment_reference_id', '==', testUser.paymentReferenceId),
		);
		expect(userQuery).toBeDefined();
		expect(userQuery?.data()).toMatchObject({
			email: testUser.email,
			auth_user_id: mockUserRecord.uid,
			personal: {
				name: testUser.firstName,
				lastname: testUser.lastName,
			},
			address: {
				country: 'CH',
			},
			currency: testPayment.currency,
			payment_reference_id: testUser.paymentReferenceId,
		});
	});

	test('storeCharge uses existing Firestore user when user exists', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		// Create existing user in Firestore
		const existingUserRef = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).add({
			email: testUser.email,
			auth_user_id: mockUserRecord.uid,
			personal: {
				name: testUser.firstName,
				lastname: testUser.lastName,
			},
			address: {
				country: 'CH',
			},
			currency: 'CHF' as Currency,
			payment_reference_id: testUser.paymentReferenceId,
			created_at: toFirebaseAdminTimestamp(DateTime.now()),
			last_updated_at: toFirebaseAdminTimestamp(DateTime.now()),
		});

		const ref = await bankTransferService.storeCharge(testPayment, testUser);

		// Verify contribution was added to the existing user
		expect(ref.parent.path).toBe(existingUserRef.path + '/' + CONTRIBUTION_FIRESTORE_PATH);
	});

	test('storeCharge creates new auth user when user does not exist', async () => {
		// Mock AuthAdmin
		// @ts-ignore
		const mockGetUserByEmail = jest.fn().mockRejectedValue(new Error('User not found'));
		// @ts-ignore
		const mockCreateUser = jest.fn().mockResolvedValue(mockUserRecord);
		const mockAuthAdmin = {
			auth: {
				getUserByEmail: mockGetUserByEmail,
				createUser: mockCreateUser,
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		await bankTransferService.storeCharge(testPayment, testUser);

		expect(mockCreateUser).toHaveBeenCalledWith({
			email: testUser.email,
			password: expect.any(String),
			displayName: `${testUser.firstName} ${testUser.lastName}`,
		});
	});

	test('storeCharge handles different currencies correctly', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		const usdPayment: BankTransferPayment = {
			amount: 500,
			intervalCount: 3,
			currency: 'USD' as Currency,
			recurring: false,
		};

		const ref = await bankTransferService.storeCharge(usdPayment, testUser);
		const contribution = await ref.get();

		expect(contribution.data()).toMatchObject({
			currency: 'USD',
			amount: 500,
			amount_chf: 500,
			monthly_interval: 3,
		});
	});

	test('storeCharge generates unique reference_id for each contribution', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		const ref1 = await bankTransferService.storeCharge(testPayment, testUser);
		const ref2 = await bankTransferService.storeCharge(testPayment, testUser);

		const contribution1 = await ref1.get();
		const contribution2 = await ref2.get();

		expect(contribution1.data()?.reference_id).not.toBe(contribution2.data()?.reference_id);
		expect(contribution1.data()?.reference_id).toBeDefined();
		expect(contribution2.data()?.reference_id).toBeDefined();
	});

	test('storeCharge throws error when auth user creation fails', async () => {
		// Mock AuthAdmin
		// @ts-ignore
		const mockGetUserByEmail = jest.fn().mockRejectedValue(new Error('User not found'));
		// @ts-ignore
		const mockCreateUser = jest.fn().mockRejectedValue(new Error('Failed to create user'));
		const mockAuthAdmin = {
			auth: {
				getUserByEmail: mockGetUserByEmail,
				createUser: mockCreateUser,
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		await expect(bankTransferService.storeCharge(testPayment, testUser)).rejects.toThrow('Failed to create user');
	});

	test('storeCharge builds contribution with correct structure', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		const ref = await bankTransferService.storeCharge(testPayment, testUser);
		const contribution = await ref.get();
		const data = contribution.data() as BankWireContribution;

		expect(data).toMatchObject({
			source: ContributionSourceKey.WIRE_TRANSFER,
			amount: testPayment.amount,
			currency: testPayment.currency,
			amount_chf: testPayment.amount,
			fees_chf: 0,
			status: StatusKey.PENDING,
			monthly_interval: testPayment.intervalCount,
			transaction_id: '',
			raw_content: '',
		});

		expect(data.reference_id).toBeDefined();
		expect(data.created).toBeDefined();
		expect(typeof data.reference_id).toBe('string');
		expect(data.reference_id.length).toBeGreaterThan(0);
	});

	test('storeCharge handles recurring and non-recurring payments', async () => {
		// Mock AuthAdmin
		const mockAuthAdmin = {
			auth: {
				// @ts-ignore
				getUserByEmail: jest.fn().mockResolvedValue(mockUserRecord),
				createUser: jest.fn(),
			},
		};
		(AuthAdmin as any).mockImplementation(() => mockAuthAdmin);

		// Test recurring payment
		const recurringPayment: BankTransferPayment = {
			amount: 1000,
			intervalCount: 1,
			currency: 'CHF' as Currency,
			recurring: true,
		};

		const ref1 = await bankTransferService.storeCharge(recurringPayment, testUser);
		const contribution1 = await ref1.get();

		expect(contribution1.data()?.monthly_interval).toBe(1);

		// Test non-recurring payment
		const nonRecurringPayment: BankTransferPayment = {
			amount: 500,
			intervalCount: 0,
			currency: 'CHF' as Currency,
			recurring: false,
		};

		const ref2 = await bankTransferService.storeCharge(nonRecurringPayment, testUser);
		const contribution2 = await ref2.get();

		expect(contribution2.data()?.monthly_interval).toBe(0);
	});
});
