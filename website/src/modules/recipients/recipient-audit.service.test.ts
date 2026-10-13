import { ProgramPermission, UserRole } from '@/generated/prisma/enums';

type StoredRecipient = {
	id: string;
	programId: string | null;
	localPartnerId: string;
	startDate: Date | null;
	suspendedAt: Date | null;
	suspensionReason: string | null;
	successorName: string | null;
	termsAccepted: boolean;
	contact: {
		firstName: string;
		lastName: string;
		callingName: string | null;
		email: string | null;
		gender: string | null;
		language: string | null;
		dateOfBirth: Date | null;
		profession: string | null;
		phone: { number: string; hasWhatsApp: boolean } | null;
		address: { street: string; number: string; city: string; zip: string; country: string | null } | null;
	};
	paymentInformation: { code: string | null; mobileMoneyProviderId: string | null; phone: { number: string } | null } | null;
};

// Repositories are mocked against this in-memory recipient so the audit
// snapshots taken before and after a write see what the write changed.
const mockStore = { recipients: new Map<string, StoredRecipient>() };

const mockFindRecipientForUpdate = jest.fn();
const mockUpdateRecipient = jest.fn();
const mockUpdateRecipientSelf = jest.fn();
const mockCreateRecipient = jest.fn();
const mockDeleteRecipient = jest.fn();
const mockRemoveRecipientFromProgram = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindRecipientOwnership = jest.fn();
const mockCreateFirebaseUser = jest.fn();
const mockUpdateFirebaseUser = jest.fn();
const mockDeleteFirebaseUser = jest.fn();

jest.mock('./recipient.repository', () => ({
	findRecipientAuditSnapshots: (_transaction: unknown, ids: string[]) =>
		Promise.resolve(
			ids.flatMap((id) => {
				const recipient = mockStore.recipients.get(id);

				return recipient ? [structuredClone(recipient)] : [];
			}),
		),
	findRecipientForUpdate: mockFindRecipientForUpdate,
	findRecipientForSelfUpdate: mockFindRecipientForUpdate,
	findRecipientForDeletion: (id: string) =>
		Promise.resolve(
			mockStore.recipients.has(id)
				? {
						id,
						contactId: 'contact-1',
						paymentInformationId: 'payment-1',
						programId: 'program-1',
						localPartnerId: 'partner-1',
						contact: { phoneId: 'phone-1', addressId: null },
						paymentInformation: { phone: { id: 'phone-2', number: '+23270000002' } },
					}
				: null,
		),
	findRecipientForProgramRemoval: () =>
		Promise.resolve({ id: 'recipient-1', programId: 'program-1', _count: { payouts: 0 } }),
	findRecipientOwnership: mockFindRecipientOwnership,
	findContactByEmail: () => Promise.resolve(null),
	findPhoneByNumber: () => Promise.resolve(null),
	findPaymentInformationByCode: () => Promise.resolve(null),
	countRecipientsForProgramsAndLocalPartners: () => Promise.resolve(1),
	createRecipient: mockCreateRecipient,
	updateRecipient: mockUpdateRecipient,
	updateRecipientSelf: mockUpdateRecipientSelf,
	deleteRecipient: mockDeleteRecipient,
	removeRecipientFromProgram: mockRemoveRecipientFromProgram,
	deletePhoneIfOrphaned: () => Promise.resolve(true),
	deleteAddressIfOrphaned: () => Promise.resolve(true),
}));
jest.mock('@/lib/database/audited-transaction', () => jest.requireActual<object>('@/lib/audit/audited-transaction.fake'));
jest.mock('@/modules/auth/auth.service', () => ({
	createFirebaseUserByPhoneNumber: mockCreateFirebaseUser,
	updateFirebaseUserByPhoneNumber: mockUpdateFirebaseUser,
	deleteFirebaseUserByPhoneNumberIfExists: mockDeleteFirebaseUser,
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/users/user.service', () => ({ isAdmin: mockIsAdmin }));
jest.mock('@/modules/local-partners/local-partner.service', () => ({ getLocalPartnerOptions: jest.fn() }));
jest.mock('@/modules/programs/program-reference.service', () => ({ getProgramNameById: jest.fn() }));

import { auditLog } from '@/lib/audit/audited-transaction.fake';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import type { UpdateRecipientInput } from './recipient.schemas';
import {
	authorizeRecipientAuditTrail,
	createRecipient,
	deleteRecipient,
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

const storedRecipient = (): StoredRecipient => ({
	id: 'recipient-1',
	programId: 'program-1',
	localPartnerId: 'partner-1',
	startDate: new Date('2026-01-01T00:00:00.000Z'),
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
		language: 'en',
		dateOfBirth: null,
		profession: null,
		phone: { number: '+23270000001', hasWhatsApp: false },
		address: null,
	},
	paymentInformation: { code: 'P-1', mobileMoneyProviderId: 'provider-1', phone: { number: '+23270000002' } },
});

const updateContext = (paymentPhone: string) => ({
	programId: 'program-1',
	localPartnerId: 'partner-1',
	contact: { id: 'contact-1', email: null, phone: { id: 'phone-1', number: '+23270000001' }, address: null },
	paymentInformation: { id: 'payment-1', code: 'P-1', phone: { id: 'phone-2', number: paymentPhone } },
});

const updateInput: UpdateRecipientInput = {
	id: 'recipient-1',
	programId: 'program-1',
	localPartnerId: 'partner-1',
	startDate: new Date('2026-01-01T00:00:00.000Z'),
	suspendedAt: null,
	suspensionReason: null,
	successorName: null,
	termsAccepted: true,
	contact: {
		firstName: 'Ada',
		lastName: 'Byron',
		callingName: null,
		email: null,
		gender: null,
		language: 'en',
		dateOfBirth: null,
		profession: null,
		phone: '+23270000001',
		hasWhatsApp: false,
		street: 'Main Street',
		number: '1',
		city: 'Freetown',
		zip: '1000',
		country: 'SL',
	},
	paymentInformation: { mobileMoneyProviderId: 'provider-1', code: 'P-1', phone: '+23270000003' },
};

const applyUpdateInput = (): void => {
	const recipient = storedRecipient();
	mockStore.recipients.set('recipient-1', {
		...recipient,
		contact: {
			...recipient.contact,
			lastName: 'Byron',
			address: { street: 'Main Street', number: '1', city: 'Freetown', zip: '1000', country: 'SL' },
		},
		paymentInformation: { code: 'P-1', mobileMoneyProviderId: 'provider-1', phone: { number: '+23270000003' } },
	});
};

describe('recipient audit trail', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		auditLog.reset();
		mockStore.recipients = new Map([['recipient-1', storedRecipient()]]);
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		});
		mockFindRecipientForUpdate.mockResolvedValue(updateContext('+23270000002'));
		mockUpdateRecipient.mockImplementation(() => {
			applyUpdateInput();

			return Promise.resolve({ id: 'recipient-1' });
		});
		mockCreateFirebaseUser.mockResolvedValue({ success: true, data: undefined });
		mockUpdateFirebaseUser.mockResolvedValue({ success: true, data: undefined });
		mockDeleteFirebaseUser.mockResolvedValue({ success: true, data: undefined });
	});

	test('records related contact, address and payment changes as one recipient event', async () => {
		const result = await updateRecipient(operator, updateInput);

		expect(result.success).toBe(true);
		expect(auditLog.committed).toEqual([
			{
				actor: { type: 'user', id: 'user-1' },
				entityType: 'recipient',
				entityId: 'recipient-1',
				action: 'update',
				source: 'portal',
				changes: [
					{ path: 'contact.lastName', old: 'Lovelace', new: 'Byron' },
					{ path: 'contact.address.street', old: null, new: 'Main Street' },
					{ path: 'contact.address.number', old: null, new: '1' },
					{ path: 'contact.address.city', old: null, new: 'Freetown' },
					{ path: 'contact.address.zip', old: null, new: '1000' },
					{ path: 'contact.address.country', old: null, new: 'SL' },
					{ path: 'paymentInformation.phone.number', old: '+23270000002', new: '+23270000003' },
				],
				metadata: null,
			},
		]);
	});

	test('attributes partner-space edits to the local partner', async () => {
		await updateRecipient(partner, updateInput);

		expect(auditLog.committed).toMatchObject([
			{ actor: { type: 'local-partner', id: 'partner-1' }, source: 'partner-space' },
		]);
	});

	test('rolls back and reverts Firebase when the audit event cannot be stored', async () => {
		auditLog.failInserts = true;

		const result = await updateRecipient(operator, updateInput);

		expect(result).toEqual({ success: false, error: 'Could not update recipient. Please try again later.' });
		expect(auditLog.committed).toEqual([]);
		expect(auditLog.rollbacks).toBe(1);
		expect(mockUpdateFirebaseUser).toHaveBeenNthCalledWith(1, '+23270000002', '+23270000003');
		expect(mockUpdateFirebaseUser).toHaveBeenNthCalledWith(2, '+23270000003', '+23270000002');
	});

	test('gives up when the payment phone changed between the unlocked read and the audited write', async () => {
		mockFindRecipientForUpdate
			.mockResolvedValueOnce(updateContext('+23270000002'))
			.mockResolvedValueOnce(updateContext('+23270000009'));

		const result = await updateRecipient(operator, updateInput);

		expect(result).toEqual({
			success: false,
			error: 'Recipient was changed in the meantime. Please try again.',
			status: undefined,
		});
		expect(mockUpdateRecipient).not.toHaveBeenCalled();
		expect(auditLog.committed).toEqual([]);
		expect(mockUpdateFirebaseUser).toHaveBeenLastCalledWith('+23270000003', '+23270000002');
	});

	test('attributes mobile app self-updates to the recipient', async () => {
		mockUpdateRecipientSelf.mockImplementation(() => {
			const recipient = storedRecipient();
			mockStore.recipients.set('recipient-1', { ...recipient, termsAccepted: false, successorName: 'Grace' });

			return Promise.resolve({ id: 'recipient-1' });
		});

		const result = await updateRecipientSelf('recipient-1', { termsAccepted: false, successorName: 'Grace' });

		expect(result.success).toBe(true);
		expect(auditLog.committed).toEqual([
			expect.objectContaining({
				actor: { type: 'recipient', id: 'recipient-1' },
				source: 'mobile-app',
				changes: [
					{ path: 'successorName', old: null, new: 'Grace' },
					{ path: 'termsAccepted', old: true, new: false },
				],
			}),
		]);
	});

	test('records deletion without keeping personal values', async () => {
		mockDeleteRecipient.mockImplementation(() => Promise.resolve(mockStore.recipients.delete('recipient-1')));

		const result = await deleteRecipient(operator, 'recipient-1');

		expect(result).toEqual({ success: true, data: { id: 'recipient-1' }, status: undefined });
		expect(auditLog.committed).toHaveLength(1);
		const [event] = auditLog.committed;
		expect(event).toMatchObject({ action: 'delete', entityId: 'recipient-1' });
		expect(event.changes).toContainEqual({ path: 'programId', old: 'program-1', new: null });
		expect(event.changes).toContainEqual({ path: 'contact.firstName', redacted: true });
		expect(JSON.stringify(event.changes)).not.toContain('Lovelace');
		expect(mockDeleteFirebaseUser).toHaveBeenCalledWith('+23270000002');
	});

	test('records no event when program removal turns out to be impossible', async () => {
		mockRemoveRecipientFromProgram.mockResolvedValue({ count: 0 });

		const result = await removeRecipientFromProgram(operator, 'recipient-1');

		expect(result.success).toBe(false);
		expect(auditLog.committed).toEqual([]);
	});

	test('records program removal', async () => {
		mockRemoveRecipientFromProgram.mockImplementation(() => {
			mockStore.recipients.set('recipient-1', { ...storedRecipient(), programId: null, startDate: null });

			return Promise.resolve({ count: 1 });
		});

		await removeRecipientFromProgram(operator, 'recipient-1');

		expect(auditLog.committed).toMatchObject([
			{
				action: 'update',
				changes: [
					{ path: 'programId', old: 'program-1', new: null },
					{ path: 'startDate', old: '2026-01-01T00:00:00.000Z', new: null },
				],
			},
		]);
	});

	test('links CSV imported recipients with one import id', async () => {
		let created = 0;
		mockCreateRecipient.mockImplementation(() => {
			created += 1;
			const id = `imported-${created}`;
			mockStore.recipients.set(id, { ...storedRecipient(), id });

			return Promise.resolve({ id });
		});
		const csv = new File(
			['firstName,lastName,programId,localPartnerId\nAda,Lovelace,program-1,partner-1\nGrace,Hopper,program-1,partner-1\n'],
			'recipients.csv',
		);

		const result = await importRecipientsCsv(partner, csv);

		expect(result).toEqual({ success: true, data: { created: 2 }, status: undefined });
		expect(auditLog.committed.map(({ action, entityId }) => ({ action, entityId }))).toEqual([
			{ action: 'create', entityId: 'imported-1' },
			{ action: 'create', entityId: 'imported-2' },
		]);
		const [first, second] = auditLog.committed;
		expect(first.metadata).toMatchObject({ operation: 'csv-import' });
		expect(typeof first.metadata?.importId).toBe('string');
		expect(second.metadata).toEqual(first.metadata);
	});

	test('records the compensating delete when the Firebase user cannot be created', async () => {
		mockCreateRecipient.mockImplementation(() => {
			mockStore.recipients.set('recipient-2', { ...storedRecipient(), id: 'recipient-2' });

			return Promise.resolve({ id: 'recipient-2' });
		});
		mockDeleteRecipient.mockImplementation(() => Promise.resolve(mockStore.recipients.delete('recipient-2')));
		mockCreateFirebaseUser.mockResolvedValue({ success: false, error: 'Firebase down' });

		const result = await createRecipient(operator, {
			...updateInput,
			paymentInformation: { code: null, phone: '+23270000004' },
		});

		expect(result.success).toBe(false);
		expect(auditLog.committed.map(({ action, metadata }) => ({ action, metadata }))).toEqual([
			{ action: 'create', metadata: null },
			{ action: 'delete', metadata: { reason: 'authentication-user-creation-failed' } },
		]);
	});
});

describe('recipient audit trail authorization', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });
		mockFindRecipientOwnership.mockResolvedValue({ id: 'recipient-1', programId: 'program-1', localPartnerId: 'partner-1' });
	});

	test('allows program operators and the owning local partner', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		});

		expect((await authorizeRecipientAuditTrail(operator, 'recipient-1')).success).toBe(true);
		expect((await authorizeRecipientAuditTrail(partner, 'recipient-1')).success).toBe(true);
	});

	test('denies program owners, other partners and contributors', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.owner }],
		});

		expect(await authorizeRecipientAuditTrail(operator, 'recipient-1')).toMatchObject({ success: false });
		expect(await authorizeRecipientAuditTrail({ ...partner, id: 'partner-2' }, 'recipient-1')).toMatchObject({
			success: false,
		});
		expect(
			await authorizeRecipientAuditTrail(
				{
					...sessionDefaults,
					type: 'contributor',
					id: 'contributor-1',
					referral: 'other',
					stripeCustomerId: null,
				},
				'recipient-1',
			),
		).toMatchObject({ success: false });
	});

	test('lets only admins read the trail of a deleted recipient', async () => {
		mockFindRecipientOwnership.mockResolvedValue(null);

		expect(await authorizeRecipientAuditTrail(operator, 'recipient-1')).toMatchObject({ success: false });

		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		expect((await authorizeRecipientAuditTrail(operator, 'recipient-1')).success).toBe(true);
		expect(await authorizeRecipientAuditTrail(partner, 'recipient-1')).toMatchObject({ success: false });
	});
});
