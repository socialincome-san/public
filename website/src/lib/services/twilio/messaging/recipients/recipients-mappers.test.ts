import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient-table.types';
import {
	contributorRowToMessagingRow,
	localPartnerRowToMessagingRow,
	recipientRowToMessagingRow,
} from './recipients-mappers';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { CH: 'CH', KE: 'KE' },
}));

describe('messaging recipients mappers', () => {
	describe('contributorRowToMessagingRow', () => {
		const base: ContributorTableViewRow = {
			id: 'c1',
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@example.com',
			firebaseAuthUserId: 'fb-1',
			country: 'CH',
			totalContributedChf: 0,
			createdAt: new Date('2025-01-01'),
		};

		test('combines firstName and lastName into name', () => {
			expect(contributorRowToMessagingRow(base).name).toBe('Ada Lovelace');
		});

		test('uses email as subtitle', () => {
			expect(contributorRowToMessagingRow(base).subtitle).toBe('ada@example.com');
		});

		test('subtitle is null when email is empty string', () => {
			expect(contributorRowToMessagingRow({ ...base, email: '' }).subtitle).toBeNull();
		});
	});

	describe('recipientRowToMessagingRow', () => {
		const base: RecipientTableViewRow = {
			id: 'r1',
			firebaseAuthUserId: 'fb-r1',
			country: 'KE',
			firstName: 'Grace',
			lastName: 'Hopper',
			paymentCode: 'PC-1',
			dateOfBirth: null,
			startDate: null,
			localPartnerName: 'Partner A',
			suspendedAt: null,
			suspensionReason: null,
			programId: 'p1',
			programName: 'Program One',
			payoutsReceived: 0,
			payoutsTotal: 0,
			payoutsProgressPercent: 0,
			createdAt: new Date('2025-01-01'),
			status: 'active',
		};

		test('combines firstName and lastName into name', () => {
			expect(recipientRowToMessagingRow(base).name).toBe('Grace Hopper');
		});

		test('subtitle prefers programName when present', () => {
			expect(recipientRowToMessagingRow(base).subtitle).toBe('Program One');
		});

		test('subtitle falls back to localPartnerName when programName is null', () => {
			expect(recipientRowToMessagingRow({ ...base, programName: null }).subtitle).toBe('Partner A');
		});

		test('subtitle is null when both programName and localPartnerName are null', () => {
			expect(recipientRowToMessagingRow({ ...base, programName: null, localPartnerName: null }).subtitle).toBeNull();
		});
	});

	describe('localPartnerRowToMessagingRow', () => {
		const base: LocalPartnerTableViewRow = {
			id: 'lp1',
			name: 'Partner Alpha',
			contactPerson: 'Jane Doe',
			email: 'jane@example.com',
			firebaseAuthUserId: 'fb-lp1',
			contactNumber: null,
			focuses: 'Health',
			recipientsCount: 5,
			candidatesCount: 2,
			createdAt: new Date('2025-01-01'),
		};

		test('uses LocalPartner name as name', () => {
			expect(localPartnerRowToMessagingRow(base).name).toBe('Partner Alpha');
		});

		test('subtitle prefers contactPerson when present', () => {
			expect(localPartnerRowToMessagingRow(base).subtitle).toBe('Jane Doe');
		});

		test('subtitle falls back to email when contactPerson is empty', () => {
			expect(localPartnerRowToMessagingRow({ ...base, contactPerson: '' }).subtitle).toBe('jane@example.com');
		});

		test('subtitle is null when contactPerson is empty and email is null', () => {
			expect(localPartnerRowToMessagingRow({ ...base, contactPerson: '', email: null }).subtitle).toBeNull();
		});
	});
});
