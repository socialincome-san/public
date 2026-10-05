const mockCountRecipientsForProgramsAndLocalPartners = jest.fn();
const mockCreateRecipient = jest.fn();
const mockGetAccessiblePrograms = jest.fn();

jest.mock('./recipient.repository', () => ({
	countRecipientsForProgramsAndLocalPartners: mockCountRecipientsForProgramsAndLocalPartners,
	createRecipient: mockCreateRecipient,
	findContactByEmail: jest.fn().mockResolvedValue(null),
	findPhoneByNumber: jest.fn().mockResolvedValue(null),
	findPaymentInformationByCode: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('@/modules/auth/auth.service', () => ({
	createFirebaseUserByPhoneNumber: jest.fn(),
}));

jest.mock('@/modules/local-partners/local-partner.service', () => ({
	getLocalPartnerOptions: jest.fn(),
}));

jest.mock('@/modules/programs/program-reference.service', () => ({
	getProgramNameById: jest.fn(),
}));

import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import type { CreateRecipientInput } from './recipient.schemas';
import { createRecipient } from './recipient.service';

const partnerSession = (id: string): LocalPartnerSession => ({
	type: 'local-partner',
	id,
	name: 'Partner',
	focuses: [],
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
});

const userSession = (id: string): UserSession => ({
	type: 'user',
	id,
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
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: false,
});

const validInput: CreateRecipientInput = {
	programId: 'program-b',
	localPartnerId: 'partner-1',
	termsAccepted: true,
	startDate: null,
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	contact: {
		firstName: 'Ada',
		lastName: 'Lovelace',
		callingName: null,
		email: null,
		gender: null,
		language: null,
		dateOfBirth: null,
		profession: null,
		country: null,
		street: null,
		number: null,
		city: null,
		zip: null,
		hasWhatsApp: false,
	},
	paymentInformation: {
		code: null,
	},
};

describe('createRecipient partner program authorization', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });
	});

	test('blocks a local partner from creating in a program without an existing recipient', async () => {
		mockCountRecipientsForProgramsAndLocalPartners.mockResolvedValue(0);

		const result = await createRecipient(partnerSession('partner-1'), validInput);

		expect(result).toEqual({ success: false, error: 'Permission denied' });
		expect(mockCountRecipientsForProgramsAndLocalPartners).toHaveBeenCalledWith(['program-b'], ['partner-1']);
		expect(mockCreateRecipient).not.toHaveBeenCalled();
	});

	test('allows a local partner to create another recipient in a program they already serve', async () => {
		mockCountRecipientsForProgramsAndLocalPartners.mockResolvedValue(1);
		mockCreateRecipient.mockResolvedValue({ id: 'recipient-1' });

		const result = await createRecipient(partnerSession('partner-1'), { ...validInput, programId: 'program-a' });

		expect(result).toEqual({ success: true, data: { id: 'recipient-1' } });
		expect(mockCreateRecipient).toHaveBeenCalled();
	});

	test('allows an operator user to create in an operated program and denies others', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-b', programName: 'B', permission: ProgramPermission.operator }],
		});
		mockCreateRecipient.mockResolvedValue({ id: 'recipient-2' });

		await expect(createRecipient(userSession('user-1'), validInput)).resolves.toEqual({
			success: true,
			data: { id: 'recipient-2' },
		});

		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-a', programName: 'A', permission: ProgramPermission.operator }],
		});

		await expect(createRecipient(userSession('user-1'), validInput)).resolves.toEqual({
			success: false,
			error: 'Permission denied',
		});
		expect(mockCountRecipientsForProgramsAndLocalPartners).not.toHaveBeenCalled();
	});
});
