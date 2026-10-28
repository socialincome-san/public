import { UserRole } from '@/generated/prisma/enums';

const mockWriteRepository = {
	createLocalPartner: jest.fn(),
	updateLocalPartner: jest.fn(),
	deleteLocalPartner: jest.fn(),
};

jest.mock('./local-partner.repository.write', () => mockWriteRepository);
jest.mock('./local-partner.repository.read', () => ({
	findLocalPartnerByName: () => Promise.resolve(null),
	findLocalPartnerBySlug: () => Promise.resolve(null),
	findContactByEmail: () => Promise.resolve(null),
	findPhoneByNumber: () => Promise.resolve(null),
	findLocalPartnerForUpdate: () =>
		Promise.resolve({
			account: { firebaseAuthUserId: 'firebase-1' },
			contact: {
				id: 'contact-1',
				email: 'partner@example.org',
				firstName: 'Pat',
				lastName: 'Partner',
				phone: null,
				address: null,
			},
		}),
	findLocalPartnerForDeletion: () =>
		Promise.resolve({ account: { firebaseAuthUserId: 'firebase-1' }, _count: { recipients: 0 } }),
}));
jest.mock('@/modules/auth/auth.service', () => ({
	updateFirebaseUserByUid: () => Promise.resolve({ success: true, data: undefined }),
	deleteFirebaseUserByUidIfExists: () => Promise.resolve({ success: true, data: undefined }),
}));
jest.mock('@/modules/users/user.service', () => ({ isAdmin: () => Promise.resolve({ success: true, data: true }) }));

jest.mock('@/modules/recipients/recipient.service', () => ({ recipientStatusService: {} }));

import type { UserSession } from '@/modules/users/user.types';
import { localPartnerUpdateSchema } from './local-partner.schemas';
import { deleteLocalPartner, updateLocalPartner } from './local-partner.service';
import type { LocalPartnerSession } from './local-partner.types';

const sessionDefaults = {
	gender: null,
	email: null,
	firstName: null,
	lastName: null,
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
};

const admin: UserSession = {
	...sessionDefaults,
	firstName: 'Max',
	lastName: 'Admin',
	type: 'user',
	id: 'user-1',
	role: UserRole.admin,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: false,
};

const partner: LocalPartnerSession = {
	...sessionDefaults,
	type: 'local-partner',
	id: 'partner-1',
	name: 'Partner',
	focuses: [],
};

const input = localPartnerUpdateSchema.parse({
	id: 'partner-1',
	name: 'Partner',
	slug: 'partner',
	contact: {
		firstName: 'Pat',
		lastName: 'Partner',
		callingName: null,
		email: 'partner@example.org',
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

describe('local partner write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.values(mockWriteRepository).forEach((write) => write.mockResolvedValue({ id: 'partner-1', focuses: [] }));
	});

	test('attributes portal and partner-space writes to the session', async () => {
		await updateLocalPartner(admin, input);
		await updateLocalPartner(partner, input);
		await deleteLocalPartner(admin, 'partner-1');

		expect(mockWriteRepository.updateLocalPartner.mock.calls.map(([audit]: unknown[]) => audit)).toEqual([
			{ actor: { type: 'user', id: 'user-1', name: 'Max Admin' }, source: 'portal' },
			{ actor: { type: 'local-partner', id: 'partner-1', name: 'Partner' }, source: 'partner-space' },
		]);
		expect(mockWriteRepository.deleteLocalPartner).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'user-1', name: 'Max Admin' }, source: 'portal' },
			'partner-1',
		);
	});
});
