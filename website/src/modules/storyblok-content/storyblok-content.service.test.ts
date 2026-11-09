import { fetchStoryblokStories } from '@/integrations/storyblok/storyblok-content.integration';
import { resultOk } from '@/lib/result';
import { getPersonsByCountryOffice } from './storyblok-content.service';

jest.mock('@/integrations/storyblok/storyblok-content.integration', () => ({ fetchStoryblokStories: jest.fn() }));
jest.mock('@/integrations/storyblok/storyblok-campaign.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-program.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-webhook.integration', () => ({}));
jest.mock('next/headers', () => ({ draftMode: jest.fn(async () => ({ isEnabled: false })) }));

describe('getPersonsByCountryOffice', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(fetchStoryblokStories).mockResolvedValue(resultOk([]));
	});

	it.each(['lr', 'LR', ' lR '])('matches both stored cases for %s', async (code) => {
		await getPersonsByCountryOffice('en', [code]);
		expect(fetchStoryblokStories).toHaveBeenCalledWith({
			language: 'en',
			version: 'published',
			content_type: 'person',
			filter_query: { countryOffice: { any_in_array: 'lr,LR' } },
		});
	});

	it('deduplicates country codes and ignores blanks', async () => {
		await getPersonsByCountryOffice('en', ['lr', 'LR', ' ', 'GH']);
		expect(fetchStoryblokStories).toHaveBeenCalledWith(
			expect.objectContaining({ filter_query: { countryOffice: { any_in_array: 'lr,LR,gh,GH' } } }),
		);
	});

	it('does not fetch without country codes', async () => {
		expect(await getPersonsByCountryOffice('en', [' ', ''])).toEqual(resultOk([]));
		expect(fetchStoryblokStories).not.toHaveBeenCalled();
	});
});
