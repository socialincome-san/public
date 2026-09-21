import { CountryCode, Currency, ProgramPermission } from '@/generated/prisma/enums';
import { resultOk } from '@/lib/service-result';

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

jest.mock('@/modules/program-access/program-access.service', () => ({
	createInitialAccessesForProgram: jest.fn(),
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/candidates/candidate.service', () => ({
	assignRandomCandidatesToProgram: jest.fn(),
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
}));

import {
	getProgramWallets,
	getPublicProgramStatsByProgramPortalSlugs,
	getPublicTargetFocusesByProgramId,
	updateProgramSettings,
} from './program.service';

describe('program service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
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
