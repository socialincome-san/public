const mockGetCommunityGlobals = jest.fn();
const mockGetAllPersons = jest.fn();
const mockGetPrimaryRoleLabels = jest.fn();
const mockGetArticlesByUuids = jest.fn();
const mockGetCommunityPages = jest.fn();

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({
	getCommunityGlobals: mockGetCommunityGlobals,
	getAllPersons: mockGetAllPersons,
	getPrimaryRoleLabels: mockGetPrimaryRoleLabels,
	getArticlesByUuids: mockGetArticlesByUuids,
	getCommunityPages: mockGetCommunityPages,
}));

import type { CommunityPage } from './community.schemas';
import { getCommunityPanelData, getPersonContributions } from './community.service';

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
		const result = await getCommunityPanelData(page({ communityEnabled: false }), 'en', 'USD');

		expect(result).toEqual({ success: true, data: null });
		expect(mockGetCommunityGlobals).not.toHaveBeenCalled();
	});

	it('counts active volunteers, their countries and the roles', async () => {
		const result = await getCommunityPanelData(page(), 'en', 'USD');

		expect(result.success && result.data).toMatchObject({ volunteerCount: 2, countryCount: 1, roleCount: 2 });
	});

	it('drops blank ticker lines and references to unknown persons', async () => {
		const result = await getCommunityPanelData(page(), 'en', 'USD');

		expect(result.success && result.data).toMatchObject({
			tickerItems: ['One', 'Two'],
			worlds: [{ name: 'In the code', people: [{ name: 'Ada Test', href: '/en/usd/person/ada' }] }],
		});
	});

	it('prefers the page articles over the default articles', async () => {
		await getCommunityPanelData(page({ communityArticles: ['page-article'] }), 'en', 'USD');

		expect(mockGetArticlesByUuids).toHaveBeenCalledWith('en', ['page-article']);
	});

	it('falls back to the default articles', async () => {
		await getCommunityPanelData(page(), 'en', 'USD');

		expect(mockGetArticlesByUuids).toHaveBeenCalledWith('en', ['default-article']);
	});

	it('fails when the role labels are missing', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetPrimaryRoleLabels.mockResolvedValue({ success: false, error: 'Not found', status: 404 });

		const result = await getCommunityPanelData(page(), 'en', 'USD');

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalled();
	});

	it('fails when the community globals are missing', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetCommunityGlobals.mockResolvedValue({ success: false, error: 'Not found', status: 404 });

		const result = await getCommunityPanelData(page(), 'en', 'USD');

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalled();
	});
});

describe('getPersonContributions', () => {
	const story = (name: string, fullSlug: string, content: Record<string, unknown>) => ({
		name,
		full_slug: fullSlug,
		content,
	});

	it('lists the pages that name the person, with the labels of their groups as roles', async () => {
		mockGetCommunityPages.mockResolvedValue({
			success: true,
			data: [
				story('Mission', 'pages/mission', {
					communityContributors: [
						{ label: 'Content', people: ['p1', 'p2'] },
						{ label: 'Research', people: [{ uuid: 'p1' }] },
						{ label: ' Content ', people: ['p1'] },
					],
				}),
				story('sierra-leone', 'pages/countries/sierra-leone', {
					title: 'Sierra Leone',
					communityContributors: [{ label: 'Translation', people: ['p1'] }],
				}),
				story('Elsewhere', 'pages/elsewhere', { communityContributors: [{ label: 'Content', people: ['p2'] }] }),
				story('Empty', 'pages/empty', {}),
			],
		});

		const result = await getPersonContributions('p1', 'en', 'USD');

		expect(result).toEqual({
			success: true,
			data: [
				{ title: 'Mission', href: '/en/usd/mission', roles: ['Content', 'Research'] },
				{ title: 'Sierra Leone', href: '/en/usd/countries/sierra-leone', roles: ['Translation'] },
			],
		});
	});

	it('fails when the pages cannot be loaded', async () => {
		mockGetCommunityPages.mockResolvedValue({ success: false, error: 'Not found', status: 404 });

		const result = await getPersonContributions('p1', 'en', 'USD');

		expect(result.success).toBe(false);
	});
});
