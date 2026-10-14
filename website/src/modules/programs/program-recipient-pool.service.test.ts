import { CountryCode, Currency, PayoutInterval, Profile, ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk } from '@/lib/result';

const mockGetAccessiblePrograms = jest.fn();
const mockFindProgramRecipientPoolContext = jest.fn();
const mockCountUnassignedCandidates = jest.fn();
const mockListLocalPartnersWithUnassignedCandidates = jest.fn();
const mockAssignRandomCandidatesToProgram = jest.fn();
const mockGetFocusOptions = jest.fn();
const mockCalculateProgramBudget = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));
jest.mock('@/modules/candidates/candidate.service', () => ({
	countUnassignedCandidates: mockCountUnassignedCandidates,
	listLocalPartnersWithUnassignedCandidates: mockListLocalPartnersWithUnassignedCandidates,
	assignRandomCandidatesToProgram: mockAssignRandomCandidatesToProgram,
}));
jest.mock('@/modules/focuses/focus.service', () => ({
	getFocusOptions: mockGetFocusOptions,
}));
jest.mock('./program-stats.service', () => ({
	calculateProgramBudget: mockCalculateProgramBudget,
}));
jest.mock('./program.repository', () => ({
	findProgramRecipientPoolContext: mockFindProgramRecipientPoolContext,
}));

import {
	assignProgramRecipientsFromPool,
	getProgramRecipientPoolSetup,
	previewProgramRecipientPool,
} from './program-recipient-pool.service';

const program = {
	id: 'program-1',
	programDurationInMonths: 12,
	payoutPerInterval: 600,
	payoutInterval: PayoutInterval.monthly,
	country: { isoCode: CountryCode.SL, currency: Currency.SLE },
};

const operatorAccess = [{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator }];

const emptySelection = { programId: 'program-1', focusIds: [], profiles: [], localPartnerIds: [] };

describe('program recipient pool', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue(resultOk(operatorAccess));
		mockFindProgramRecipientPoolContext.mockResolvedValue(program);
		mockGetFocusOptions.mockResolvedValue(resultOk([{ id: 'focus-health', name: 'Health' }]));
		mockListLocalPartnersWithUnassignedCandidates.mockResolvedValue(resultOk([{ id: 'partner-1', name: 'Partner' }]));
		mockCountUnassignedCandidates.mockResolvedValue(resultOk({ count: 7 }));
		mockCalculateProgramBudget.mockResolvedValue(
			resultOk({
				calculatedTotalBudget: 7200,
				displayMonthlyCost: 600,
				totalBudgetTooltipText: '',
				payoutPerIntervalMin: 1,
				payoutPerIntervalMax: 2,
			}),
		);
	});

	test('lets an operator load setup from the stored program', async () => {
		await expect(getProgramRecipientPoolSetup('user-1', 'program-1')).resolves.toEqual(
			resultOk({
				programId: 'program-1',
				countryCode: CountryCode.SL,
				programDurationInMonths: 12,
				payoutPerInterval: 600,
				payoutCurrency: Currency.SLE,
				payoutInterval: PayoutInterval.monthly,
				focusOptions: [{ id: 'focus-health', name: 'Health' }],
				localPartnerOptions: [{ id: 'partner-1', name: 'Partner' }],
				totalCount: 7,
			}),
		);
		expect(mockCountUnassignedCandidates).toHaveBeenCalledWith({
			countryCode: CountryCode.SL,
			focusIds: [],
			profiles: [],
			localPartnerIds: [],
		});
		expect(mockListLocalPartnersWithUnassignedCandidates).toHaveBeenCalledWith(CountryCode.SL);
	});

	test('rejects an owner without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }]),
		);

		await expect(assignProgramRecipientsFromPool('user-1', { ...emptySelection, recipientCount: 1 })).resolves.toEqual(
			resultFail('Permission denied'),
		);
		expect(mockAssignRandomCandidatesToProgram).not.toHaveBeenCalled();
	});

	test('rejects a program the user cannot access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([{ programId: 'other-program', programName: 'Other', permission: ProgramPermission.operator }]),
		);

		await expect(previewProgramRecipientPool('user-1', emptySelection)).resolves.toEqual(resultFail('Permission denied'));
		expect(mockFindProgramRecipientPoolContext).not.toHaveBeenCalled();
	});

	test('counts and assigns with the program country rather than a caller-supplied country', async () => {
		mockFindProgramRecipientPoolContext.mockResolvedValue({
			...program,
			country: { isoCode: CountryCode.GH, currency: Currency.GHS },
		});
		mockAssignRandomCandidatesToProgram.mockResolvedValue(resultOk({ assigned: 2 }));

		await previewProgramRecipientPool('user-1', {
			...emptySelection,
			focusIds: ['focus-health'],
			profiles: [Profile.female, Profile.youth],
			localPartnerIds: ['partner-1'],
		});
		await assignProgramRecipientsFromPool('user-1', {
			...emptySelection,
			focusIds: ['focus-health'],
			profiles: [Profile.female, Profile.youth],
			localPartnerIds: ['partner-1'],
			recipientCount: 2,
		});

		const expectedFilter = {
			countryCode: CountryCode.GH,
			focusIds: ['focus-health'],
			profiles: [Profile.female, Profile.youth],
			localPartnerIds: ['partner-1'],
		};
		expect(mockCountUnassignedCandidates).toHaveBeenCalledWith(expectedFilter);
		expect(mockAssignRandomCandidatesToProgram).toHaveBeenCalledWith('program-1', 2, expectedFilter);
	});

	test('counts all unassigned candidates in the program country when no filters are selected', async () => {
		await previewProgramRecipientPool('user-1', emptySelection);

		expect(mockCountUnassignedCandidates).toHaveBeenCalledWith({
			countryCode: CountryCode.SL,
			focusIds: [],
			profiles: [],
			localPartnerIds: [],
		});
	});

	test('passes focus, profile, and local partner filters through to the candidate count', async () => {
		await previewProgramRecipientPool('user-1', {
			programId: 'program-1',
			focusIds: ['focus-health', 'focus-poverty'],
			profiles: [Profile.male, Profile.female],
			localPartnerIds: ['partner-1'],
		});

		expect(mockCountUnassignedCandidates).toHaveBeenCalledWith({
			countryCode: CountryCode.SL,
			focusIds: ['focus-health', 'focus-poverty'],
			profiles: [Profile.male, Profile.female],
			localPartnerIds: ['partner-1'],
		});
	});

	test('previews cost from the stored payout terms', async () => {
		await previewProgramRecipientPool('user-1', {
			...emptySelection,
			recipientCount: 2,
			displayCurrency: Currency.CHF,
		});

		expect(mockCalculateProgramBudget).toHaveBeenCalledWith({
			amountOfRecipients: 2,
			programDuration: 12,
			defaultPayoutPerInterval: 600,
			payoutPerInterval: 600,
			payoutInterval: PayoutInterval.monthly,
			payoutCurrency: Currency.SLE,
			displayCurrency: Currency.CHF,
		});
	});

	test('returns the candidate service failure when not enough candidates are available', async () => {
		mockAssignRandomCandidatesToProgram.mockResolvedValue(resultFail('Not enough candidates available'));

		await expect(assignProgramRecipientsFromPool('user-1', { ...emptySelection, recipientCount: 9 })).resolves.toEqual(
			resultFail('Not enough candidates available'),
		);
	});

	test('returns the number of candidates actually assigned', async () => {
		mockAssignRandomCandidatesToProgram.mockResolvedValue(resultOk({ assigned: 2 }));

		await expect(assignProgramRecipientsFromPool('user-1', { ...emptySelection, recipientCount: 2 })).resolves.toEqual(
			resultOk({ assigned: 2 }),
		);
	});
});
