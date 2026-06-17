import { type PrismaClient } from '@/generated/prisma/client';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';
import type { AppReviewModeService } from '../app-review-mode/app-review-mode.service';
import type { ServiceResult } from '../core/base.types';
import type { FirebaseAdminService } from '../firebase/firebase-admin.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { PUBLIC_RECIPIENTS_MAX_ROWS } from './recipient-public.constants';
import { RecipientReadService } from './recipient-read.service';
import type { RecipientStatusService } from './recipient-status.service';

jest.mock('@/generated/prisma/client', () => ({
	PayoutInterval: { monthly: 'monthly', quarterly: 'quarterly', yearly: 'yearly' },
	PayoutStatus: { confirmed: 'confirmed', paid: 'paid' },
	PrismaClient: class {},
	ProgramPermission: { operator: 'operator', owner: 'owner' },
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

const baseRecipient = {
	id: 'recipient-1',
	startDate: new Date('2025-01-01T00:00:00.000Z'),
	suspendedAt: null,
	suspensionReason: null,
	createdAt: new Date('2025-01-01T00:00:00.000Z'),
	paymentInformation: { code: 'PAY123' },
	contact: {
		firstName: 'Jane',
		lastName: 'Doe',
		dateOfBirth: new Date('1990-05-15T00:00:00.000Z'),
		address: { country: 'SLE' },
	},
	program: {
		id: 'program-1',
		name: 'Test Program',
		programDurationInMonths: 12,
		payoutInterval: 'monthly' as const,
	},
	localPartner: {
		name: 'Partner A',
		account: { firebaseAuthUserId: 'firebase-uid-1' },
		contact: { address: { country: 'SLE' } },
	},
	payouts: [{ status: 'paid' as const }],
};

const createService = ({
	program = { id: 'program-1' },
	recipients = [baseRecipient],
	totalCount = recipients.length,
}: {
	program?: { id: string } | null;
	recipients?: (typeof baseRecipient)[];
	totalCount?: number;
} = {}) => {
	const findUnique = jest.fn().mockResolvedValue(program);
	const findMany = jest.fn().mockResolvedValue(recipients);
	const count = jest.fn().mockResolvedValue(totalCount);

	const db = {
		program: { findUnique },
		recipient: { findMany, count },
	};

	const recipientStatusService = {
		countPaidOrConfirmedPayouts: jest.fn().mockReturnValue({ success: true as const, data: 1 }),
		getRecipientLifecycleStatus: jest.fn().mockReturnValue({ success: true as const, data: 'active' as const }),
	} as unknown as RecipientStatusService;

	const service = new RecipientReadService(
		db as unknown as PrismaClient,
		{} as ProgramAccessReadService,
		{} as FirebaseAdminService,
		{} as AppReviewModeService,
		recipientStatusService,
	);

	return { service, findUnique, findMany, count };
};

describe('RecipientReadService public table view', () => {
	test('getPublicRecipientsTableView returns program not found when program is missing', async () => {
		const { service } = createService({ program: null });

		const result = await service.getPublicRecipientsTableView('missing-program');

		expectFailure(result, 'Program not found');
	});

	test('getPublicRecipientsTableView returns empty table for program without recipients', async () => {
		const { service } = createService({ recipients: [], totalCount: 0 });

		const result = await service.getPublicRecipientsTableView('program-1');
		const data = expectSuccess(result);

		expect(data.tableRows).toEqual([]);
		expect(data.totalCount).toBe(0);
	});

	test('getPublicRecipientsTableView obfuscates name, age, and payment code', async () => {
		const { service } = createService();

		const result = await service.getPublicRecipientsTableView('program-1');
		const data = expectSuccess(result);

		expect(data.tableRows).toHaveLength(1);
		expect(data.tableRows[0]).toMatchObject({
			firstName: OBFUSCATED_SENTINEL,
			lastName: '',
			dateOfBirth: OBFUSCATED_SENTINEL,
			paymentCode: OBFUSCATED_SENTINEL,
			firebaseAuthUserId: '',
		});
		expect(data.tableRows[0]?.firstName).not.toBe('Jane');
		expect(data.tableRows[0]?.lastName).not.toBe('Doe');
		expect(data.tableRows[0]?.dateOfBirth).not.toEqual(baseRecipient.contact.dateOfBirth);
	});

	test('getPublicRecipientsTableView caps fetched rows but reports full total count', async () => {
		const cappedRecipients = Array.from({ length: PUBLIC_RECIPIENTS_MAX_ROWS }, (_, index) => ({
			...baseRecipient,
			id: `recipient-${index}`,
		}));
		const { service, findMany } = createService({
			recipients: cappedRecipients,
			totalCount: PUBLIC_RECIPIENTS_MAX_ROWS + 1,
		});

		const result = await service.getPublicRecipientsTableView('program-1');
		const data = expectSuccess(result);

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				take: PUBLIC_RECIPIENTS_MAX_ROWS,
			}),
		);
		expect(data.tableRows).toHaveLength(PUBLIC_RECIPIENTS_MAX_ROWS);
		expect(data.totalCount).toBe(PUBLIC_RECIPIENTS_MAX_ROWS + 1);
	});
});
