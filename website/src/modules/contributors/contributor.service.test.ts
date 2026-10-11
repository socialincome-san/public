import type { Result } from '@/lib/result';

const mockFindContributorByEmail = jest.fn();
const mockCreateContributorFromEmailAndName = jest.fn();
const mockFindContributorByEmailOrFirebaseAuthUserId = jest.fn();
const mockFindFirebaseUserByEmail = jest.fn();
const mockCreateFirebaseUserByEmail = jest.fn();

const mockFindContributorPaymentReferenceByEmail = jest.fn();
const mockFindContributorPaymentReferenceById = jest.fn();
const mockFindContributorByPaymentReferenceId = jest.fn();
const mockFindContributorForSelfUpdate = jest.fn();
const mockUpdateContributorSelf = jest.fn();

jest.mock('./contributor.repository', () => ({
	findContributorByEmail: mockFindContributorByEmail,
	createContributorFromEmailAndName: mockCreateContributorFromEmailAndName,
	findContributorByEmailOrFirebaseAuthUserId: mockFindContributorByEmailOrFirebaseAuthUserId,
	findContributorPaymentReferenceByEmail: mockFindContributorPaymentReferenceByEmail,
	findContributorPaymentReferenceById: mockFindContributorPaymentReferenceById,
	findContributorByPaymentReferenceId: mockFindContributorByPaymentReferenceId,
	findContributorForSelfUpdate: mockFindContributorForSelfUpdate,
	updateContributorSelf: mockUpdateContributorSelf,
}));

jest.mock('@/modules/auth/auth.service', () => ({
	findFirebaseUserByEmail: mockFindFirebaseUserByEmail,
	createFirebaseUserByEmail: mockCreateFirebaseUserByEmail,
	updateFirebaseUserByUid: jest.fn(),
}));

jest.mock('@/modules/newsletter/newsletter.service', () => ({
	subscribeToNewsletter: jest.fn().mockResolvedValue({ success: true, data: undefined }),
	toNewsletterLanguage: (language: string) => language,
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));

import {
	getOrCreateContributorFromEmailAndName,
	getOrCreateReferenceIdByEmail,
	getOwnedPaymentReferenceId,
} from './contributor.service';

const expectSuccess = <T>(result: Result<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const accountData = {
	email: 'ada@example.com',
	firstName: 'Ada',
	lastName: 'Lovelace',
};

describe('getOrCreateContributorFromEmailAndName', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns the existing contributor without creating a new one', async () => {
		const existing = {
			id: 'contributor-1',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		mockFindContributorByEmail.mockResolvedValue(existing);

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(expectSuccess(result)).toEqual({ contributor: existing, isNewContributor: false });
		expect(mockFindFirebaseUserByEmail).not.toHaveBeenCalled();
		expect(mockCreateContributorFromEmailAndName).not.toHaveBeenCalled();
	});

	test('creates Firebase user and contributor when no email match exists', async () => {
		mockFindContributorByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({ success: true, data: null });
		mockCreateFirebaseUserByEmail.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		const created = {
			id: 'contributor-2',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		mockCreateContributorFromEmailAndName.mockResolvedValue(created);

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(expectSuccess(result)).toEqual({ contributor: created, isNewContributor: true });
		expect(mockCreateFirebaseUserByEmail).toHaveBeenCalledWith({
			email: 'ada@example.com',
			displayName: 'Ada Lovelace',
		});
		expect(mockCreateContributorFromEmailAndName).toHaveBeenCalledWith(accountData, 'firebase-uid-1');
	});

	test('fails when Firebase user creation fails', async () => {
		mockFindContributorByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({ success: true, data: null });
		mockCreateFirebaseUserByEmail.mockResolvedValue({ success: false, error: 'firebase-down' });

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('Could not create contributor authentication user');
		}
		expect(mockCreateContributorFromEmailAndName).not.toHaveBeenCalled();
	});

	test('returns concurrent contributor when create hits email unique constraint', async () => {
		const concurrent = {
			id: 'contributor-3',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		mockFindContributorByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({ success: true, data: null });
		mockCreateFirebaseUserByEmail.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		mockCreateContributorFromEmailAndName.mockRejectedValue({
			code: 'P2002',
			meta: { target: ['email'] },
		});
		mockFindContributorByEmailOrFirebaseAuthUserId.mockResolvedValue(concurrent);

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(expectSuccess(result)).toEqual({ contributor: concurrent, isNewContributor: false });
		expect(mockFindContributorByEmailOrFirebaseAuthUserId).toHaveBeenCalledWith('ada@example.com', 'firebase-uid-1');
	});

	test('returns concurrent contributor when create hits firebaseAuthUserId unique constraint', async () => {
		const concurrent = {
			id: 'contributor-4',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		mockFindContributorByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({ success: true, data: null });
		mockCreateFirebaseUserByEmail.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		mockCreateContributorFromEmailAndName.mockRejectedValue({
			code: 'P2002',
			meta: { target: ['firebaseAuthUserId'] },
		});
		mockFindContributorByEmailOrFirebaseAuthUserId.mockResolvedValue(concurrent);

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(expectSuccess(result)).toEqual({ contributor: concurrent, isNewContributor: false });
		expect(mockFindContributorByEmailOrFirebaseAuthUserId).toHaveBeenCalledWith('ada@example.com', 'firebase-uid-1');
	});

	test('fails for unrelated create errors', async () => {
		mockFindContributorByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({ success: true, data: null });
		mockCreateFirebaseUserByEmail.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		mockCreateContributorFromEmailAndName.mockRejectedValue(new Error('db-down'));

		const result = await getOrCreateContributorFromEmailAndName(accountData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Could not get or create contributor from email');
		}
	});
});

describe('getOrCreateReferenceIdByEmail', () => {
	const previousFixedTime = process.env.NEXT_PUBLIC_FIXED_TIME;

	beforeEach(() => {
		jest.clearAllMocks();
		mockFindContributorByPaymentReferenceId.mockResolvedValue(null);
		process.env.NEXT_PUBLIC_FIXED_TIME = '2023-11-14T22:13:20.000Z';
	});

	afterEach(() => {
		if (previousFixedTime === undefined) {
			delete process.env.NEXT_PUBLIC_FIXED_TIME;
		} else {
			process.env.NEXT_PUBLIC_FIXED_TIME = previousFixedTime;
		}
	});

	test('refuses to return an existing donor payment reference', async () => {
		mockFindContributorPaymentReferenceByEmail.mockResolvedValue({
			id: 'contributor-1',
			paymentReferenceId: 'stolen-reference',
			contact: { email: 'victim@example.com' },
		});

		const result = await getOrCreateReferenceIdByEmail('victim@example.com');

		expect(result).toEqual({
			success: false,
			error: 'An account already exists for this email. Please sign in.',
		});
	});

	test('returns the signed-in contributor payment reference when the email matches', async () => {
		mockFindContributorPaymentReferenceById.mockResolvedValue({
			id: 'contributor-1',
			paymentReferenceId: '1735689600000',
			contact: { email: 'Donor@Example.com' },
		});

		const result = await getOwnedPaymentReferenceId('contributor-1', 'donor@example.com');

		expect(result).toEqual({ success: true, data: '1735689600000', status: undefined });
	});

	test('does not return a payment reference for a different email', async () => {
		mockFindContributorPaymentReferenceById.mockResolvedValue({
			id: 'contributor-1',
			paymentReferenceId: '1735689600000',
			contact: { email: 'owner@example.com' },
		});

		const result = await getOwnedPaymentReferenceId('contributor-1', 'other@example.com');

		expect(result).toEqual({ success: true, data: null, status: undefined });
	});

	test('mints a payment reference for the signed-in contributor when one is missing', async () => {
		mockFindContributorPaymentReferenceById.mockResolvedValue({
			id: 'contributor-1',
			paymentReferenceId: null,
			contact: { email: 'donor@example.com' },
		});
		mockFindContributorForSelfUpdate.mockResolvedValue({
			account: { firebaseAuthUserId: 'firebase-1' },
			contact: { id: 'contact-1', email: 'donor@example.com', address: null },
		});
		mockUpdateContributorSelf.mockResolvedValue({ id: 'contributor-1' });

		const result = await getOwnedPaymentReferenceId('contributor-1', 'donor@example.com');

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data).toBe(String(new Date('2023-11-14T22:13:20.000Z').getTime()));
		expect(mockUpdateContributorSelf).toHaveBeenCalledWith(
			'contributor-1',
			expect.objectContaining({ paymentReferenceId: result.data }),
			'contact-1',
			undefined,
		);
	});

	test('skips a payment reference that already belongs to another donor', async () => {
		mockFindContributorPaymentReferenceByEmail.mockResolvedValue(null);
		mockFindContributorByPaymentReferenceId.mockImplementation((referenceId: string) =>
			Promise.resolve(
				referenceId === String(new Date('2023-11-14T22:13:20.000Z').getTime()) ? { id: 'contributor-existing' } : null,
			),
		);

		const result = await getOrCreateReferenceIdByEmail('new@example.com');

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data).toBe(String(new Date('2023-11-14T22:13:20.000Z').getTime() + 1));
	});

	test('mints a new reference for an unused email', async () => {
		mockFindContributorPaymentReferenceByEmail.mockResolvedValue(null);

		const result = await getOrCreateReferenceIdByEmail('new@example.com');

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data).toBe(String(new Date('2023-11-14T22:13:20.000Z').getTime()));
	});
});
