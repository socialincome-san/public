import { UserRole } from '@/generated/prisma/enums';

const mockRecipientEntity = { type: 'recipient' };
const mockWriteRepository = {
	createCandidate: jest.fn(),
	updateCandidate: jest.fn(),
	deleteCandidate: jest.fn(),
	updateCandidateProgramAssignments: jest.fn(),
};
const mockIsAdmin = jest.fn();

const existing = {
	localPartnerId: 'partner-1',
	programId: null,
	contact: { id: 'contact-1', email: null, phone: null, address: null },
	paymentInformation: null,
};

jest.mock('./candidate.repository.write', () => mockWriteRepository);
jest.mock('./candidate.repository.read', () => ({
	findCandidateForUpdate: () => Promise.resolve(existing),
	findCandidateForDeletion: () => Promise.resolve({ ...existing, paymentInformation: null }),
	findContactByEmail: () => Promise.resolve(null),
	findPhoneByNumber: () => Promise.resolve(null),
	findPaymentInformationByCode: () => Promise.resolve(null),
}));
jest.mock('@/modules/auth/auth.service', () => ({}));
jest.mock('@/modules/countries/country.service', () => ({ getCountryIsoCode: jest.fn() }));
jest.mock('@/modules/users/user.service', () => ({ isAdmin: mockIsAdmin }));
jest.mock('@/modules/recipients/recipient.service', () => ({ recipientAuditedEntity: mockRecipientEntity }));

import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import type { CandidateUpdateInput } from './candidate.schemas';
import { createCandidate, deleteCandidate, importCandidatesCsv, updateCandidate } from './candidate.service';

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

const portal = { actor: { type: 'user', id: 'user-1', name: 'Max Admin' }, source: 'portal' };
const partnerSpace = { actor: { type: 'local-partner', id: 'partner-1', name: 'Partner' }, source: 'partner-space' };

const input: CandidateUpdateInput = {
	id: 'candidate-1',
	localPartnerId: 'partner-1',
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	termsAccepted: false,
	contact: {
		firstName: 'Ada',
		lastName: 'Lovelace',
		callingName: null,
		email: null,
		gender: null,
		language: null,
		dateOfBirth: null,
		profession: null,
		hasWhatsApp: false,
		street: null,
		number: null,
		city: null,
		zip: null,
		country: null,
	},
	paymentInformation: { code: null },
};

describe('candidate write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		Object.values(mockWriteRepository).forEach((write) => write.mockResolvedValue({ id: 'candidate-1' }));
	});

	test('attributes portal and partner-space writes to the session', async () => {
		await createCandidate(admin, input);
		await updateCandidate(partner, input);
		await deleteCandidate(admin, 'candidate-1');

		expect(mockWriteRepository.createCandidate).toHaveBeenCalledWith(mockRecipientEntity, portal, input, 'partner-1');
		expect(mockWriteRepository.updateCandidate).toHaveBeenCalledWith(
			mockRecipientEntity,
			partnerSpace,
			{ ...input, localPartnerId: undefined },
			expect.anything(),
		);
		expect(mockWriteRepository.deleteCandidate).toHaveBeenCalledWith(mockRecipientEntity, portal, 'candidate-1');
	});

	test('links CSV imported candidates with one import id', async () => {
		const csv = new File(
			['firstName,lastName,localPartnerId\nAda,Lovelace,partner-1\nGrace,Hopper,partner-1\n'],
			'candidates.csv',
		);

		await expect(importCandidatesCsv(admin, csv)).resolves.toMatchObject({ success: true, data: { created: 2 } });

		const [first, second] = mockWriteRepository.createCandidate.mock.calls.map(([, audit]: unknown[]) => audit);
		expect(first).toMatchObject({ ...portal, metadata: { operation: 'csv-import' } });
		expect(first).toHaveProperty('metadata.importId');
		expect(second).toEqual(first);
	});
});
