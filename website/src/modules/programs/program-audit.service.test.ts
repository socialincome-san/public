import { CountryCode, ProgramPermission, UserRole } from '@/generated/prisma/enums';

const mockAssignRandomCandidatesToProgram = jest.fn();
const mockRemoveRecipientsFromProgram = jest.fn();
const mockDeleteProgram = jest.fn();
const mockCreateProgram = jest.fn();
const mockUpdateOrganizationProgramAccesses = jest.fn();

const mockCreateDefaultCampaign = jest.fn();
const mockDetachProgramSurveys = jest.fn();
const mockDeleteProgramCampaigns = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: () =>
		Promise.resolve({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program 1', permission: ProgramPermission.operator }],
		}),
}));
jest.mock('@/modules/candidates/candidate.service', () => ({
	assignRandomCandidatesToProgram: mockAssignRandomCandidatesToProgram,
}));
jest.mock('@/modules/surveys/survey.service', () => ({
	detachProgramSurveys: mockDetachProgramSurveys,
}));
jest.mock('@/modules/campaigns/campaign.service', () => ({
	createDefaultCampaign: mockCreateDefaultCampaign,
	deleteProgramCampaigns: mockDeleteProgramCampaigns,
}));
jest.mock('@/modules/recipients/recipient.service', () => ({
	removeRecipientsFromProgram: mockRemoveRecipientsFromProgram,
}));
jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: () => Promise.resolve({ success: true, data: CountryCode.SL }),
}));
jest.mock('@/modules/organizations/organization.service', () => ({
	createOrganizationFromEmail: () => Promise.resolve({ success: true, data: { id: 'organization-1' } }),
	getOperatorFallbackOrganizationId: () => Promise.resolve({ success: true, data: 'organization-2' }),
}));
jest.mock('@/modules/users/user.service', () => ({
	createPublicOnboardingUser: () => Promise.resolve({ success: true, data: { userId: 'user-2' } }),
	getActiveOrganizationId: () => Promise.resolve({ success: true, data: 'organization-1' }),
	isUserEmailAvailable: () => Promise.resolve({ success: true, data: true }),
}));
jest.mock('./program-stats.service', () => ({}));
jest.mock('./program.repository.write', () => ({
	createProgram: mockCreateProgram,
	deleteProgram: mockDeleteProgram,
	updateOrganizationProgramAccesses: mockUpdateOrganizationProgramAccesses,
}));
jest.mock('./program.repository.read', () => ({
	findProgramNameById: () => Promise.resolve({ name: 'Program 1' }),
	findProgramDeletionBlockers: () => Promise.resolve({ hasPayouts: false, hasContributions: false }),
	findProgramIdsByOrganization: () => Promise.resolve([{ programId: 'program-old' }, { programId: 'program-1' }]),
}));

import type { UserSession } from '@/modules/users/user.types';
import type { ProgramCreateInput } from './program.schemas';
import { createProgram, deleteProgram, updateOrganizationProgramAccesses } from './program.service';

const operator: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Operator',
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
	hasAnyOperatorProgramAccess: true,
};

const input = { countryId: 'country-1', amountOfRecipientsForStart: 2 } as ProgramCreateInput;

describe('program recipient write attribution', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAssignRandomCandidatesToProgram.mockResolvedValue({ success: true, data: { assigned: 2 } });
		mockRemoveRecipientsFromProgram.mockResolvedValue({ success: true, data: undefined });
		mockCreateDefaultCampaign.mockResolvedValue({ success: true, data: { id: 'campaign-1' } });
		mockDeleteProgramCampaigns.mockResolvedValue({ success: true, data: undefined });
		mockDetachProgramSurveys.mockResolvedValue({ success: true, data: undefined });
		mockCreateProgram.mockResolvedValue({ id: 'program-1' });
	});

	test('attributes candidate assignment and the default campaign to the portal user or the new website user', async () => {
		await createProgram(input, operator);
		await createProgram(input, { email: 'ada@example.org', firstName: 'Ada', lastName: 'Lovelace' });

		expect(mockCreateProgram.mock.calls.map(([audit]: unknown[]) => audit)).toEqual([
			{ actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' },
			{ actor: { type: 'user', id: 'user-2', name: 'Ada Lovelace' }, source: 'website' },
		]);
		expect(mockCreateProgram).toHaveBeenCalledWith(
			expect.anything(),
			input,
			expect.objectContaining({ ownerOrganizationId: 'organization-1', operatorOrganizationId: 'organization-2' }),
		);
		expect(mockCreateDefaultCampaign.mock.calls.map(([audit]: unknown[]) => audit)).toEqual(
			mockAssignRandomCandidatesToProgram.mock.calls.map(([audit]: unknown[]) => audit),
		);
		expect(mockAssignRandomCandidatesToProgram.mock.calls.map(([audit]: unknown[]) => audit)).toEqual([
			{
				actor: { type: 'user', id: 'user-1', name: 'Max Operator' },
				source: 'portal',
				metadata: { operation: 'program-creation', programId: 'program-1' },
			},
			{
				actor: { type: 'user', id: 'user-2', name: 'Ada Lovelace' },
				source: 'website',
				metadata: { operation: 'program-creation', programId: 'program-1' },
			},
		]);
	});

	test('removes recipients, campaigns and survey schedules through their modules before deleting', async () => {
		await expect(deleteProgram(operator, 'program-1')).resolves.toMatchObject({ success: true });

		expect(mockDeleteProgramCampaigns).toHaveBeenCalledWith(
			expect.objectContaining({ metadata: { operation: 'program-deletion', programId: 'program-1' } }),
			'program-1',
		);
		expect(mockDeleteProgram).toHaveBeenCalledWith(
			expect.objectContaining({ metadata: { operation: 'program-deletion', programId: 'program-1' } }),
			'program-1',
		);
		expect(mockDetachProgramSurveys).toHaveBeenCalledWith(
			expect.objectContaining({ metadata: { operation: 'program-deletion', programId: 'program-1' } }),
			'program-1',
		);
		expect(mockDetachProgramSurveys.mock.invocationCallOrder[0]).toBeLessThan(
			mockDeleteProgram.mock.invocationCallOrder[0] ?? 0,
		);
		expect(mockDeleteProgramCampaigns.mock.invocationCallOrder[0]).toBeLessThan(
			mockDeleteProgram.mock.invocationCallOrder[0] ?? 0,
		);

		expect(mockRemoveRecipientsFromProgram).toHaveBeenCalledWith(
			{
				actor: { type: 'user', id: 'user-1', name: 'Max Operator' },
				source: 'portal',
				metadata: { operation: 'program-deletion', programId: 'program-1' },
			},
			'program-1',
		);
		expect(mockRemoveRecipientsFromProgram.mock.invocationCallOrder[0]).toBeLessThan(
			mockDeleteProgram.mock.invocationCallOrder[0] ?? 0,
		);
	});

	test('keeps the program when unassigning fails', async () => {
		mockRemoveRecipientsFromProgram.mockResolvedValue({ success: false, error: 'Could not unassign' });

		await expect(deleteProgram(operator, 'program-1')).resolves.toMatchObject({ success: false });
		expect(mockDeleteProgram).not.toHaveBeenCalled();
	});

	test('stores an event for every program whose accesses an organization change touches', async () => {
		const audit = { actor: { type: 'user' as const, id: 'admin-1' }, source: 'portal' as const };
		const input = { organizationId: 'organization-1', ownedProgramIds: ['program-1'], operatedProgramIds: ['program-new'] };

		await updateOrganizationProgramAccesses(audit, input);

		expect(mockUpdateOrganizationProgramAccesses).toHaveBeenCalledWith(
			audit,
			['program-old', 'program-1', 'program-new'],
			input,
		);
	});
});
