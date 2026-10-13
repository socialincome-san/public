import { ProgramPermission, UserRole } from '@/generated/prisma/enums';

const mockWriteRepository = {
	createRecipient: jest.fn(),
	updateRecipient: jest.fn(),
	updateRecipientSelf: jest.fn(),
	removeRecipientFromProgram: jest.fn(),
	deleteRecipient: jest.fn(),
};
const mockFindRecipientVersions = jest.fn();
const mockFindRecipientsForChanges = jest.fn();
const mockFindRecipientChangePage = jest.fn();
const mockGetAccessiblePrograms = jest.fn();
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
	findRecipientsForChanges: mockFindRecipientsForChanges,
	findRecipientChangePage: mockFindRecipientChangePage,
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
jest.mock('@/modules/local-partners/local-partner.service', () => ({ getLocalPartnerOptions: jest.fn() }));
jest.mock('@/modules/programs/program-reference.service', () => ({ getProgramNameById: jest.fn() }));

import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';
import type { UpdateRecipientInput } from './recipient.schemas';
import {
	createRecipient,
	deleteRecipient,
	getRecipientChangeTableView,
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

const portal = { actor: { type: 'user', id: 'user-1', name: null }, source: 'portal' };

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
			{ actor: { type: 'local-partner', id: 'partner-1', name: 'Partner' }, source: 'partner-space' },
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

describe('getRecipientChangeTableView', () => {
	const version = (id: string, entityId: string, action: string, snapshot: object | null, actorName: string | null) => ({
		id,
		entityId,
		action,
		actorType: actorName ? 'user' : 'recipient',
		actorName,
		source: actorName ? 'portal' : 'mobile-app',
		snapshot,
		createdAt: new Date('2026-10-01T00:00:00.000Z'),
	});
	const query = { page: 1, pageSize: 10, search: '' };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator },
				{ programId: 'program-2', programName: 'Program 2', permission: ProgramPermission.owner },
			],
		});
		mockFindRecipientsForChanges.mockResolvedValue([
			{
				id: 'recipient-1',
				contact: { firstName: 'Ada', lastName: 'Lovelace' },
				program: { id: 'program-1', name: 'Program 1' },
			},
			{
				id: 'recipient-2',
				contact: { firstName: 'Grace', lastName: 'Hopper' },
				program: { id: 'program-1', name: 'Program 1' },
			},
		]);
		const history = [
			version('v1', 'recipient-1', 'create', { paymentInformation: { phone: { number: '+232111' } } }, 'Max Operator'),
			version('v2', 'recipient-1', 'update', { paymentInformation: { phone: { number: '+232222' } } }, null),
		];
		mockFindRecipientChangePage.mockResolvedValue({ versions: [history[1]], totalCount: 2 });
		mockFindRecipientVersions.mockResolvedValue(history);
	});

	test('only covers recipients in programs the user operates', async () => {
		await getRecipientChangeTableView('user-1', query);

		expect(mockFindRecipientsForChanges).toHaveBeenCalledWith(['program-1']);
	});

	test('returns nothing without operated programs', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-2', programName: 'Program 2', permission: ProgramPermission.owner }],
		});

		await expect(getRecipientChangeTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: { tableRows: [], totalCount: 0 },
		});
		expect(mockFindRecipientChangePage).not.toHaveBeenCalled();
	});

	test('diffs each row against the previous version, also from an earlier page', async () => {
		const result = await getRecipientChangeTableView('user-1', query);

		expect(result).toMatchObject({
			success: true,
			data: {
				totalCount: 2,
				tableRows: [
					{
						id: 'v2',
						recipientName: 'Ada Lovelace',
						programName: 'Program 1',
						actorName: 'Ada Lovelace',
						source: 'mobile-app',
						changes: [{ path: 'paymentInformation.phone.number', old: '+232111', new: '+232222' }],
					},
				],
			},
		});
	});

	test('narrows to searched and filtered recipients before paging', async () => {
		await getRecipientChangeTableView('user-1', { ...query, page: 2, search: 'grace' });

		expect(mockFindRecipientChangePage).toHaveBeenCalledWith({ recipientIds: ['recipient-2'], skip: 10, take: 10 });
	});
});
