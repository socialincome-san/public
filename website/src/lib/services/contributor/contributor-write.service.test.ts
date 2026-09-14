jest.mock('@/generated/prisma/client', () => ({
	ContributorReferralSource: {
		other: 'other',
	},
	Prisma: {
		PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
			code: string;
			meta?: { target?: string | string[] };

			constructor(
				message: string,
				{ code, meta }: { code: string; clientVersion?: string; meta?: { target?: string | string[] } },
			) {
				super(message);
				this.code = code;
				this.meta = meta;
			}
		},
	},
}));

import { ContributorReferralSource, Prisma } from '@/generated/prisma/client';
import type { ContactRelationsService } from '../contact/contact-relations.service';
import type { FirebaseAdminService } from '../firebase/firebase-admin.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { SendgridSubscriptionService } from '../sendgrid/sendgrid-subscription.service';
import type { ContributorValidationService } from './contributor-validation.service';
import { ContributorWriteService } from './contributor-write.service';

describe('ContributorWriteService.getOrCreateFromEmailAndName', () => {
	const createService = () => {
		const findFirst = jest.fn();
		const create = jest.fn();
		const getOrCreateUser = jest.fn();

		const db = {
			contributor: {
				findFirst,
				create,
			},
		};

		const firebaseAdminService = {
			getOrCreateUser,
		} as unknown as FirebaseAdminService;

		const service = new ContributorWriteService(
			db as never,
			{} as ProgramAccessReadService,
			firebaseAdminService,
			{} as SendgridSubscriptionService,
			{} as ContributorValidationService,
			{} as ContactRelationsService,
		);

		return { service, findFirst, create, getOrCreateUser };
	};

	const accountData = {
		email: 'ada@example.com',
		firstName: 'Ada',
		lastName: 'Lovelace',
	};

	test('returns the existing contributor without creating a new one', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		const existing = {
			id: 'contributor-1',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		findFirst.mockResolvedValue(existing);

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ contributor: existing, isNewContributor: false });
		}
		expect(getOrCreateUser).not.toHaveBeenCalled();
		expect(create).not.toHaveBeenCalled();
	});

	test('creates Firebase user and contributor when no email match exists', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		findFirst.mockResolvedValue(null);
		getOrCreateUser.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		const created = {
			id: 'contributor-2',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		create.mockResolvedValue(created);

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ contributor: created, isNewContributor: true });
		}
		expect(getOrCreateUser).toHaveBeenCalledWith({
			email: 'ada@example.com',
			displayName: 'Ada Lovelace',
		});
		expect(create).toHaveBeenCalledWith({
			data: {
				referral: ContributorReferralSource.other,
				account: {
					create: {
						firebaseAuthUserId: 'firebase-uid-1',
					},
				},
				contact: {
					create: {
						firstName: 'Ada',
						lastName: 'Lovelace',
						email: 'ada@example.com',
					},
				},
			},
			include: { contact: true },
		});
	});

	test('fails when Firebase user creation fails', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		findFirst.mockResolvedValue(null);
		getOrCreateUser.mockResolvedValue({ success: false, error: 'firebase-down' });

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Failed to create Firebase user');
		}
		expect(create).not.toHaveBeenCalled();
	});

	test('returns concurrent contributor when create hits email unique constraint', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		const concurrent = {
			id: 'contributor-3',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(concurrent);
		getOrCreateUser.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		create.mockRejectedValue(
			new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
				code: 'P2002',
				clientVersion: 'test',
				meta: { target: ['email'] },
			}),
		);

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ contributor: concurrent, isNewContributor: false });
		}
		expect(findFirst).toHaveBeenCalledTimes(2);
		expect(findFirst).toHaveBeenLastCalledWith({
			where: {
				OR: [{ contact: { email: 'ada@example.com' } }, { account: { firebaseAuthUserId: 'firebase-uid-1' } }],
			},
			include: { contact: true },
		});
	});

	test('returns concurrent contributor when create hits firebaseAuthUserId unique constraint', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		const concurrent = {
			id: 'contributor-4',
			contact: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
		};
		findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(concurrent);
		getOrCreateUser.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		create.mockRejectedValue(
			new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
				code: 'P2002',
				clientVersion: 'test',
				meta: { target: ['firebaseAuthUserId'] },
			}),
		);

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ contributor: concurrent, isNewContributor: false });
		}
		expect(findFirst).toHaveBeenLastCalledWith({
			where: {
				OR: [{ contact: { email: 'ada@example.com' } }, { account: { firebaseAuthUserId: 'firebase-uid-1' } }],
			},
			include: { contact: true },
		});
	});

	test('fails for unrelated create errors', async () => {
		const { service, findFirst, create, getOrCreateUser } = createService();
		findFirst.mockResolvedValue(null);
		getOrCreateUser.mockResolvedValue({ success: true, data: { uid: 'firebase-uid-1' } });
		create.mockRejectedValue(new Error('db-down'));

		const result = await service.getOrCreateFromEmailAndName(accountData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Could not get or create contributor from email');
		}
	});
});
