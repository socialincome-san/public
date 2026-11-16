const mockGetPrograms = jest.fn();
const mockGetCandidatesByLocalPartnerSlug = jest.fn();
const mockGetProgramRecipientCountsByLocalPartnerSlug = jest.fn();

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getPrograms: mockGetPrograms }));

jest.mock('@/modules/campaigns/campaign.service', () => ({ getDefaultCampaignForProgram: jest.fn() }));

jest.mock('@/modules/programs/program.service', () => ({
	getPublicProgramFilterDataByPortalSlugs: jest.fn().mockResolvedValue({ success: true, data: {} }),
}));

jest.mock('./local-partner.service', () => ({
	getCandidatesByLocalPartnerSlug: mockGetCandidatesByLocalPartnerSlug,
	getProgramRecipientCountsByLocalPartnerSlug: mockGetProgramRecipientCountsByLocalPartnerSlug,
	getPublicLocalPartnerDashboardStatsBySlug: jest.fn(),
	getPublicLocalPartnerOverviewStatsBySlugs: jest.fn(),
}));

import { getLocalPartnerProgramSummaries } from './local-partner-public.service';

describe('getLocalPartnerProgramSummaries', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetProgramRecipientCountsByLocalPartnerSlug.mockResolvedValue({ success: true, data: {} });
	});

	test('includes the candidates even when the programs cannot be loaded', async () => {
		mockGetPrograms.mockResolvedValue({ success: false, error: 'storyblok down' });
		mockGetCandidatesByLocalPartnerSlug.mockResolvedValue({ success: true, data: { count: 4, isPartnerScoped: true } });

		await expect(getLocalPartnerProgramSummaries('en', 'aurora')).resolves.toMatchObject({
			success: true,
			data: { programs: [], candidates: { count: 4, isPartnerScoped: true } },
		});
	});

	test('propagates a failed candidates lookup instead of returning an empty result', async () => {
		mockGetPrograms.mockResolvedValue({ success: true, data: [] });
		mockGetCandidatesByLocalPartnerSlug.mockResolvedValue({ success: false, error: 'db down' });

		await expect(getLocalPartnerProgramSummaries('en', 'aurora')).resolves.toMatchObject({
			success: false,
			error: 'db down',
		});
	});
});
