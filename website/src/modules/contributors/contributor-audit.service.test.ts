import { ContributorReferralSource, ProgramPermission, UserRole } from '@/generated/prisma/enums';

const mockWriteRepository = {
	createContributor: jest.fn(),
	updateContributor: jest.fn(),
	updateContributorSelf: jest.fn(),
};

jest.mock('./contributor.repository.write', () => mockWriteRepository);
jest.mock('./contributor.repository.read', () => ({
	findContactByEmail: () => Promise.resolve(null),
	findPhoneByNumber: () => Promise.resolve(null),
	findContributorForPortalUpdate: () =>
		Promise.resolve({
			account: { firebaseAuthUserId: 'firebase-1' },
			contact: {
				id: 'contact-1',
				email: 'ada@example.org',
				firstName: 'Ada',
				lastName: 'Lovelace',
				phone: null,
				address: null,
			},
		}),
	findContributorProgramIds: () => Promise.resolve([{ campaign: { programId: 'program-1' } }]),
	findContributorForSelfUpdate: () =>
		Promise.resolve({
			account: { firebaseAuthUserId: 'firebase-1' },
			contact: { id: 'contact-1', email: 'ada@example.org', address: null },
		}),
}));
jest.mock('@/modules/auth/auth.service', () => ({
	findFirebaseUserByEmail: () => Promise.resolve({ success: true, data: { uid: 'firebase-1' } }),
	createFirebaseUserByEmail: jest.fn(),
	updateFirebaseUserByUid: jest.fn(),
}));
jest.mock('@/modules/newsletter/newsletter.service', () => ({}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: () =>
		Promise.resolve({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		}),
}));

import type { UserSession } from '@/modules/users/user.types';
import { contributorCreateSchema } from './contributor.schemas';
import { createContributor, updateContributor, updateContributorSelf } from './contributor.service';

const operator: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Operator',
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const portal = { actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' };

const input = contributorCreateSchema.parse({
	referral: ContributorReferralSource.other,
	paymentReferenceId: null,
	stripeCustomerId: null,
	contact: {
		firstName: 'Ada',
		lastName: 'Lovelace',
		callingName: null,
		email: 'ada@example.org',
		gender: null,
		language: null,
		profession: null,
		street: null,
		number: null,
		city: null,
		zip: null,
		country: null,
	},
});

describe('contributor write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.values(mockWriteRepository).forEach((write) => write.mockResolvedValue({ id: 'contributor-1' }));
	});

	test('attributes portal writes to the session', async () => {
		await createContributor(operator, input);
		await updateContributor(operator, { ...input, id: 'contributor-1' });

		expect(mockWriteRepository.createContributor).toHaveBeenCalledWith(portal, expect.anything(), 'firebase-1');
		expect(mockWriteRepository.updateContributor).toHaveBeenCalledWith(portal, expect.anything(), expect.anything());
	});

	test('passes the caller context to self-updates', async () => {
		const website = {
			actor: { type: 'contributor' as const, id: 'contributor-1', name: 'Ada Lovelace' },
			source: 'website' as const,
		};

		await updateContributorSelf(website, 'contributor-1', { contact: { email: 'ada@example.org' } });

		expect(mockWriteRepository.updateContributorSelf).toHaveBeenCalledWith(
			website,
			'contributor-1',
			{ contact: { email: 'ada@example.org' } },
			'contact-1',
			undefined,
		);
	});
});
