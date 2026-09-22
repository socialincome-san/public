import type { ServiceResult } from '@/lib/service-result';

const mockFindContributorByEmail = jest.fn();
const mockCreateContributorFromEmailAndName = jest.fn();
const mockFindContributorByEmailOrFirebaseAuthUserId = jest.fn();
const mockFindFirebaseUserByEmail = jest.fn();
const mockCreateFirebaseUserByEmail = jest.fn();

jest.mock('./contributor.repository', () => ({
	findContributorByEmail: mockFindContributorByEmail,
	createContributorFromEmailAndName: mockCreateContributorFromEmailAndName,
	findContributorByEmailOrFirebaseAuthUserId: mockFindContributorByEmailOrFirebaseAuthUserId,
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

import { getOrCreateContributorFromEmailAndName } from './contributor.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
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
			expect(result.error).toContain('Failed to create Firebase user');
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
