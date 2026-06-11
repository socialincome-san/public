import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import { resolveStoryblokLink } from './storyblok.utils';

describe('resolveStoryblokLink', () => {
	it('resolves unset internal Storyblok links to a placeholder', () => {
		const link: StoryblokMultilink = {
			id: '',
			url: '',
			linktype: 'story',
			fieldtype: 'multilink',
			cached_url: '',
		};

		expect(resolveStoryblokLink(link, 'en', 'int')).toBe('#');
	});
});
