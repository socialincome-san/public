import { CountryCode, Currency, ProgramPermission } from '@/generated/prisma/enums';
import { resultOk } from '@/lib/result';

const mockGetAccessiblePrograms = jest.fn();
const mockIsReadyForFirstPayoutInterval = jest.fn();
const mockFindProgramWallets = jest.fn();
const mockFindPublicProgramStatsBySlugs = jest.fn();
const mockFindPublicTargetFocusesByProgramId = jest.fn();
const mockFindProgramByName = jest.fn();
const mockFindProgramBySlug = jest.fn();
const mockFindProgramSettings = jest.fn();
const mockUpdateProgramSettings = jest.fn();
const mockGetCountryIsoCode = jest.fn();
const mockValidateOrganizationIds = jest.fn();
const mockDeleteProgram = jest.fn();
const mockProgramRecipients = new Map<string, string | null>();
const mockIsAdmin = jest.fn();
const mockFindPaginatedPrograms = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	createInitialAccessesForProgram: jest.fn(),
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/candidates/candidate.service', () => ({
	assignRandomCandidatesToProgram: jest.fn(),
}));
jest.mock('@/lib/database/audited-transaction', () => jest.requireActual<object>('@/lib/audit/audited-transaction.fake'));
jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientIdsByProgram: () => Promise.resolve({ success: true, data: ['recipient-1', 'recipient-2'] }),
	recipientAuditEntity: {
		type: 'recipient',
		fields: { programId: 'plain' },
		findSnapshots: (_transaction: unknown, ids: string[]) =>
			Promise.resolve(ids.map((id) => ({ id, programId: mockProgramRecipients.get(id) ?? null }))),
	},
}));
jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: mockGetCountryIsoCode,
}));
jest.mock('@/modules/organizations/organization.service', () => ({
	createOrganizationFromEmail: jest.fn(),
	getOperatorFallbackOrganizationId: jest.fn(),
	getOrganizationReferenceOptions: jest.fn(),
	validateOrganizationIds: mockValidateOrganizationIds,
}));
jest.mock('@/modules/users/user.service', () => ({
	createPublicOnboardingUser: jest.fn(),
	getActiveOrganizationId: jest.fn(),
	isUserEmailAvailable: jest.fn(),
	isAdmin: mockIsAdmin,
}));
jest.mock('./program-stats.service', () => ({
	isReadyForFirstPayoutInterval: mockIsReadyForFirstPayoutInterval,
}));
jest.mock('./program.repository', () => ({
	findProgramWallets: mockFindProgramWallets,
	findPublicProgramStatsBySlugs: mockFindPublicProgramStatsBySlugs,
	findPublicTargetFocusesByProgramId: mockFindPublicTargetFocusesByProgramId,
	findProgramByName: mockFindProgramByName,
	findProgramBySlug: mockFindProgramBySlug,
	findProgramSettings: mockFindProgramSettings,
	updateProgramSettings: mockUpdateProgramSettings,
	findProgramNameById: () => Promise.resolve({ name: 'Program' }),
	findProgramDeletionBlockers: () => Promise.resolve({ hasPayouts: false, hasContributions: false }),
	deleteProgram: mockDeleteProgram,
	findPaginatedPrograms: mockFindPaginatedPrograms,
}));

import { auditLog } from '@/lib/audit/audited-transaction.fake';
import {
	deleteProgram,
	getPaginatedProgramTableView,
	getProgramWallets,
	getPublicProgramStatsByProgramPortalSlugs,
	getPublicTargetFocusesByProgramId,
	updateProgramSettings,
} from './program.service';

describe('program service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue(resultOk(true));
	});

	it('loads and maps programs for a related-record table', async () => {
		const query = {
			page: 1,
			pageSize: 10,
			search: '',
			organizationId: 'organization-1',
			programPermission: ProgramPermission.owner,
		};
		mockFindPaginatedPrograms.mockResolvedValue({
			programs: [
				{
					id: 'program-1',
					name: 'Program',
					country: { isoCode: CountryCode.SL },
					programAccesses: [
						{ permission: ProgramPermission.owner, organization: { name: 'Owner' } },
						{ permission: ProgramPermission.operator, organization: { name: 'Operator' } },
					],
					targetFocuses: [{ focus: { name: 'Education' } }],
					_count: { recipients: 4 },
					createdAt: new Date('2026-01-01T00:00:00.000Z'),
				},
			],
			totalCount: 1,
		});

		const result = await getPaginatedProgramTableView('admin-1', query);

		expect(mockFindPaginatedPrograms).toHaveBeenCalledWith(query);
		expect(result).toEqual(
			resultOk({
				tableRows: [
					{
						id: 'program-1',
						name: 'Program',
						country: CountryCode.SL,
						ownerOrganizations: 'Owner',
						operatorOrganizations: 'Operator',
						focuses: 'Education',
						recipientsCount: 4,
						createdAt: new Date('2026-01-01T00:00:00.000Z'),
					},
				],
				totalCount: 1,
			}),
		);
	});

	it('maps public target focuses', async () => {
		mockFindPublicTargetFocusesByProgramId.mockResolvedValue([{ focus: { id: 'focus-1', slug: 'health', name: 'Health' } }]);

		await expect(getPublicTargetFocusesByProgramId('program-1')).resolves.toEqual(
			resultOk([{ id: 'focus-1', slug: 'health', name: 'Health' }]),
		);
	});

	it('builds wallets only from accessible programs', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([
				{
					programId: 'program-1',
					programName: 'Program',
					permission: ProgramPermission.operator,
				},
			]),
		);
		mockFindProgramWallets.mockResolvedValue([
			{
				id: 'program-1',
				name: 'Program',
				country: { isoCode: CountryCode.SL, currency: Currency.SLE },
				recipients: [{ payouts: [{ amount: 20 }, { amount: 30 }] }],
			},
		]);
		mockIsReadyForFirstPayoutInterval.mockResolvedValue(resultOk(true));

		const result = await getProgramWallets('user-1');

		expect(result).toEqual(
			resultOk({
				wallets: [
					{
						id: 'program-1',
						programName: 'Program',
						country: CountryCode.SL,
						payoutCurrency: Currency.SLE,
						recipientsCount: 1,
						totalPayoutsSum: 50,
						permission: ProgramPermission.operator,
						isReadyForFirstPayouts: true,
					},
				],
			}),
		);
	});

	it('deduplicates portal slugs and maps public stats', async () => {
		mockFindPublicProgramStatsBySlugs.mockResolvedValue([
			{
				slug: 'program',
				country: { isoCode: CountryCode.SL, currency: Currency.SLE },
				_count: { campaigns: 2, recipients: 3 },
				recipients: [{ payouts: [{ amount: 20, amountChf: 10 }] }],
			},
		]);

		const result = await getPublicProgramStatsByProgramPortalSlugs([' program ', 'program']);

		expect(mockFindPublicProgramStatsBySlugs).toHaveBeenCalledWith(['program']);
		expect(result).toEqual(
			resultOk({
				program: {
					campaignsCount: 2,
					recipientsCount: 3,
					countryIsoCode: CountryCode.SL,
					payoutCurrency: Currency.SLE,
					totalPayoutsSum: 20,
					totalPayoutsSumChf: 10,
				},
			}),
		);
	});

	it('rejects settings updates without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([
				{
					programId: 'program-1',
					programName: 'Program',
					permission: ProgramPermission.owner,
				},
			]),
		);

		const result = await updateProgramSettings('user-1', {
			id: 'program-1',
			name: 'Program',
			slug: 'program',
			countryId: 'country-1',
			coveredByReserves: false,
			programDurationInMonths: 12,
			payoutPerInterval: 25,
			payoutInterval: 'monthly',
			targetFocuses: [],
			targetProfiles: [],
			ownerOrganizationIds: [],
			operatorOrganizationIds: ['organization-1'],
		});

		expect(result).toEqual({ success: false, error: 'Permission denied' });
		expect(mockUpdateProgramSettings).not.toHaveBeenCalled();
	});
});

describe('program deletion audit', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		auditLog.reset();
		mockProgramRecipients.clear();
		mockProgramRecipients.set('recipient-1', 'program-1');
		mockProgramRecipients.set('recipient-2', 'program-1');
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }]),
		);
		mockDeleteProgram.mockImplementation(() => {
			mockProgramRecipients.set('recipient-1', null);
			mockProgramRecipients.set('recipient-2', null);
		});
	});

	it('records that each recipient lost the deleted program', async () => {
		await expect(deleteProgram('user-1', 'program-1')).resolves.toEqual(resultOk(undefined));

		expect(mockDeleteProgram).toHaveBeenCalledWith(expect.anything(), 'program-1', ['recipient-1', 'recipient-2']);
		expect(auditLog.committed).toEqual(
			['recipient-1', 'recipient-2'].map((entityId) => ({
				actor: { type: 'user', id: 'user-1' },
				entityType: 'recipient',
				entityId,
				action: 'update',
				source: 'portal',
				changes: [{ path: 'programId', old: 'program-1', new: null }],
				metadata: { operation: 'program-deletion' },
			})),
		);
	});

	it('keeps the program when the deletion cannot be audited', async () => {
		auditLog.failInserts = true;

		await expect(deleteProgram('user-1', 'program-1')).resolves.toMatchObject({ success: false });
		expect(auditLog.rollbacks).toBe(1);
	});
});
