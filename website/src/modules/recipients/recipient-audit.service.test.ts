import { ProgramPermission, UserRole } from '@/generated/prisma/enums';

const mockWriteRepository = {
	createRecipient: jest.fn(),
	updateRecipient: jest.fn(),
	updateRecipientSelf: jest.fn(),
	removeRecipientFromProgram: jest.fn(),
	deleteRecipient: jest.fn(),
};
const mockFindRecipientVersions = jest.fn();
const mockFindRecipientOwnership = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
const mockIsAdmin = jest.fn();
const mockCreateFirebaseUser = jest.fn();
const mockDeleteFirebaseUser = jest.fn();

const updateContext = {
	programId: 'program-1',
	localPartnerId: 'partner-1',
	contact: { id: 'contact-1', email: null, phone: null, address: null },
	paymentInformation: null,
};

jest.mock('./recipient.write.repository', () => mockWriteRepository);
jest.mock('./recipient.repository', () => ({
	findRecipientForUpdate: () => Promise.resolve(updateContext),
	findRecipientForSelfUpdate: () => Promise.resolve({ contact: { phone: null }, paymentInformation: null }),
	findRecipientForProgramRemoval: () =>
		Promise.resolve({ id: 'recipient-1', programId: 'program-1', _count: { payouts: 0 } }),
	findRecipientForDeletion: () =>
		Promise.resolve({
			id: 'recipient-1',
			contactId: 'contact-1',
			paymentInformationId: 'payment-1',
			programId: 'program-1',
			localPartnerId: 'partner-1',
			contact: { phoneId: null, addressId: null },
			paymentInformation: { phone: { id: 'phone-1', number: '+23270000001' } },
		}),
	findRecipientOwnership: mockFindRecipientOwnership,
	findRecipientVersions: mockFindRecipientVersions,
	findContactByEmail: () => Promise.resolve(null),
	findPhoneByNumber: () => Promise.resolve(null),
	findPaymentInformationByCode: () => Promise.resolve(null),
	countRecipientsForProgramsAndLocalPartners: () => Promise.resolve(1),
}));
jest.mock('@/modules/auth/auth.service', () => ({
	createFirebaseUserByPhoneNumber: mockCreateFirebaseUser,
	deleteFirebaseUserByPhoneNumberIfExists: mockDeleteFirebaseUser,
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/users/user.service', () => ({ isAdmin: mockIsAdmin }));
jest.mock('@/modules/local-partners/local-partner.service', () => ({ getLocalPartnerOptions: jest.fn() }));
jest.mock('@/modules/programs/program-reference.service', () => ({ getProgramNameById: jest.fn() }));

import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import type { UpdateRecipientInput } from './recipient.schemas';
import {
	createRecipient,
	deleteRecipient,
	getRecipientAuditTrail,
	importRecipientsCsv,
	removeRecipientFromProgram,
	updateRecipient,
	updateRecipientSelf,
} from './recipient.service';

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

const operator: UserSession = {
	...sessionDefaults,
	type: 'user',
	id: 'user-1',
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const partner: LocalPartnerSession = {
	...sessionDefaults,
	type: 'local-partner',
	id: 'partner-1',
	name: 'Partner',
	focuses: [],
};

const portal = { actor: { type: 'user', id: 'user-1' }, source: 'portal' };

const input: UpdateRecipientInput = {
	id: 'recipient-1',
	programId: 'program-1',
	localPartnerId: 'partner-1',
	startDate: null,
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	termsAccepted: true,
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

describe('recipient write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		});
		mockCreateFirebaseUser.mockResolvedValue({ success: true, data: undefined });
		mockDeleteFirebaseUser.mockResolvedValue({ success: true, data: undefined });
		Object.values(mockWriteRepository).forEach((write) => write.mockResolvedValue({ id: 'recipient-1', count: 1 }));
	});

	test('attributes portal and partner-space updates to the session', async () => {
		await updateRecipient(operator, input);
		await updateRecipient(partner, input);

		expect(mockWriteRepository.updateRecipient.mock.calls.map(([audit]: unknown[]) => audit)).toEqual([
			portal,
			{ actor: { type: 'local-partner', id: 'partner-1' }, source: 'partner-space' },
		]);
	});

	test('attributes mobile app self-updates to the recipient', async () => {
		await updateRecipientSelf('recipient-1', { termsAccepted: true });

		expect(mockWriteRepository.updateRecipientSelf).toHaveBeenCalledWith(
			{ actor: { type: 'recipient', id: 'recipient-1' }, source: 'mobile-app' },
			'recipient-1',
			{ termsAccepted: true },
			null,
		);
	});

	test('attributes program removal and deletion to the session', async () => {
		await removeRecipientFromProgram(operator, 'recipient-1');
		await deleteRecipient(operator, 'recipient-1');

		expect(mockWriteRepository.removeRecipientFromProgram).toHaveBeenCalledWith(portal, 'recipient-1', 'program-1');
		expect(mockWriteRepository.deleteRecipient).toHaveBeenCalledWith(portal, 'recipient-1');
		expect(mockDeleteFirebaseUser).toHaveBeenCalledWith('+23270000001');
	});

	test('links CSV imported recipients with one import id', async () => {
		const csv = new File(
			['firstName,lastName,programId,localPartnerId\nAda,Lovelace,program-1,partner-1\nGrace,Hopper,program-1,partner-1\n'],
			'recipients.csv',
		);

		await expect(importRecipientsCsv(operator, csv)).resolves.toMatchObject({ success: true, data: { created: 2 } });

		const [first, second] = mockWriteRepository.createRecipient.mock.calls.map(([audit]: unknown[]) => audit);
		expect(first).toMatchObject({ ...portal, metadata: { operation: 'csv-import' } });
		expect(first).toHaveProperty('metadata.importId');
		expect(second).toEqual(first);
	});

	test('records why a created recipient is deleted again', async () => {
		mockCreateFirebaseUser.mockResolvedValue({ success: false, error: 'Firebase down' });

		const result = await createRecipient(operator, { ...input, paymentInformation: { code: null, phone: '+23270000004' } });

		expect(result.success).toBe(false);
		expect(mockWriteRepository.deleteRecipient).toHaveBeenCalledWith(
			{ ...portal, metadata: { reason: 'authentication-user-creation-failed' } },
			'recipient-1',
		);
	});
});

describe('getRecipientAuditTrail', () => {
	const version = (id: string, action: string, snapshot: object | null) => ({
		id,
		action,
		actorType: 'user',
		actorId: 'user-1',
		source: 'portal',
		snapshot,
		metadata: null,
		createdAt: new Date('2026-10-01T00:00:00.000Z'),
	});

	beforeEach(() => {
		jest.clearAllMocks();
		mockFindRecipientOwnership.mockResolvedValue({ id: 'recipient-1', programId: 'program-1', localPartnerId: 'partner-1' });
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });
		mockFindRecipientVersions.mockResolvedValue([
			version('v1', 'create', { successorName: null, paymentInformation: { phone: { number: '+232111' } } }),
			version('v2', 'update', { successorName: null, paymentInformation: { phone: { number: '+232111' } } }),
			version('v3', 'update', { successorName: 'Grace', paymentInformation: { phone: { number: '+232222' } } }),
		]);
	});

	test('computes changes between versions, newest first, skipping updates without changes', async () => {
		const result = await getRecipientAuditTrail(partner, 'recipient-1');

		expect(result.success && result.data.map(({ id, actor, changes }) => ({ id, actor, changes }))).toEqual([
			{
				id: 'v3',
				actor: { type: 'user', id: 'user-1' },
				changes: [
					{ path: 'successorName', old: null, new: 'Grace' },
					{ path: 'paymentInformation.phone.number', old: '+232111', new: '+232222' },
				],
			},
			{
				id: 'v1',
				actor: { type: 'user', id: 'user-1' },
				changes: [{ path: 'paymentInformation.phone.number', old: null, new: '+232111' }],
			},
		]);
	});

	test('diffs the first change of an older recipient against its baseline without listing it', async () => {
		mockFindRecipientVersions.mockResolvedValue([
			version('v1', 'baseline', { successorName: null }),
			version('v2', 'update', { successorName: 'Grace' }),
		]);

		const result = await getRecipientAuditTrail(partner, 'recipient-1');

		expect(result.success && result.data.map(({ id, changes }) => ({ id, changes }))).toEqual([
			{ id: 'v2', changes: [{ path: 'successorName', old: null, new: 'Grace' }] },
		]);
	});

	test('does not read versions for sessions without access', async () => {
		await expect(getRecipientAuditTrail(operator, 'recipient-1')).resolves.toMatchObject({ success: false });
		await expect(getRecipientAuditTrail({ ...partner, id: 'partner-2' }, 'recipient-1')).resolves.toMatchObject({
			success: false,
		});
		expect(mockFindRecipientVersions).not.toHaveBeenCalled();
	});

	test('lets only admins read the trail of a deleted recipient', async () => {
		mockFindRecipientOwnership.mockResolvedValue(null);
		await expect(getRecipientAuditTrail(operator, 'recipient-1')).resolves.toMatchObject({ success: false });

		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		await expect(getRecipientAuditTrail(operator, 'recipient-1')).resolves.toMatchObject({ success: true });
	});
});
