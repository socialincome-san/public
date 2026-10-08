const mockGetCommunityGlobals = jest.fn();
const mockGetAllPersons = jest.fn();
const mockGetPrimaryRoleLabels = jest.fn();
const mockGetArticlesByUuids = jest.fn();

jest.mock('@/modules/storyblok-content/storyblok-content.service', () => ({
	getCommunityGlobals: mockGetCommunityGlobals,
	getAllPersons: mockGetAllPersons,
	getPrimaryRoleLabels: mockGetPrimaryRoleLabels,
	getArticlesByUuids: mockGetArticlesByUuids,
}));

import type { CommunityPage } from './community.schemas';
import { getCommunityPanelData } from './community.service';

const person = (uuid: string, firstName: string, volunteerStatus: string, country: string) => ({
	uuid,
	slug: firstName.toLowerCase(),
	content: { firstName, lastName: 'Test', fullName: `${firstName} Test`, volunteerStatus, country },
});

const page = (overrides: CommunityPage = {}): CommunityPage => ({ communityEnabled: true, ...overrides });

describe('getCommunityPanelData', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetCommunityGlobals.mockResolvedValue({
			success: true,
			data: {
				content: {
					headline: 'Made by many.',
					tickerItems: 'One\n\n Two ',
					worlds: [{ name: 'In the code', people: ['p1', 'missing'] }],
					defaultArticles: ['default-article'],
				},
			},
		});
		mockGetAllPersons.mockResolvedValue({
			success: true,
			data: [person('p1', 'Ada', 'active', 'ch'), person('p2', 'Bo', 'active', 'ch'), person('p3', 'Cy', 'inactive', 'sl')],
		});
		mockGetPrimaryRoleLabels.mockResolvedValue({ success: true, data: { dev: 'Development', design: 'Design' } });
		mockGetArticlesByUuids.mockResolvedValue({ success: true, data: [] });
	});

	it('returns null without loading anything when the page has not enabled it', async () => {
		const result = await getCommunityPanelData(page({ communityEnabled: false }), 'en', 'int');

		expect(result).toEqual({ success: true, data: null });
		expect(mockGetCommunityGlobals).not.toHaveBeenCalled();
	});

	it('counts active volunteers, their countries and the roles', async () => {
		const result = await getCommunityPanelData(page(), 'en', 'int');

		expect(result.success && result.data).toMatchObject({ volunteerCount: 2, countryCount: 1, roleCount: 2 });
	});

	it('drops blank ticker lines and references to unknown persons', async () => {
		const result = await getCommunityPanelData(page(), 'en', 'int');

		expect(result.success && result.data).toMatchObject({
			tickerItems: ['One', 'Two'],
			worlds: [{ name: 'In the code', people: [{ name: 'Ada Test', href: '/en/int/person/ada' }] }],
		});
	});

	it('prefers the page articles over the default articles', async () => {
		await getCommunityPanelData(page({ communityArticles: ['page-article'] }), 'en', 'int');

		expect(mockGetArticlesByUuids).toHaveBeenCalledWith('en', ['page-article']);
	});

	it('falls back to the default articles', async () => {
		await getCommunityPanelData(page(), 'en', 'int');

		expect(mockGetArticlesByUuids).toHaveBeenCalledWith('en', ['default-article']);
	});

	it('fails when the role labels are missing', async () => {
		mockGetPrimaryRoleLabels.mockResolvedValue({ success: false, error: 'Not found', status: 404 });

		const result = await getCommunityPanelData(page(), 'en', 'int');

		expect(result.success).toBe(false);
	});

	it('fails when the community globals are missing', async () => {
		mockGetCommunityGlobals.mockResolvedValue({ success: false, error: 'Not found', status: 404 });

		const result = await getCommunityPanelData(page(), 'en', 'int');

		expect(result.success).toBe(false);
	});
});
