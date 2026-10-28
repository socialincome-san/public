import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';
import { findPathTails, getLinkPathTails } from './page-metadata';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getPublishedPageLinks: jest.fn() }));

const homeLink: StoryblokPublishedLink = {
	uuid: 'home',
	slug: 'pages/home',
	is_folder: false,
	published: true,
	alternates: [
		{ lang: 'de', path: '', name: null, published: true, translated_slug: 'pages/home' },
		{ lang: 'fr', path: '', name: null, published: false, translated_slug: 'pages/home' },
	],
};

describe('getLinkPathTails', () => {
	it('keeps the home page, whose path tail is empty', () => {
		expect(getLinkPathTails(homeLink)).toEqual(
			new Map([
				['en', ''],
				['de', ''],
			]),
		);
	});
});

describe('findPathTails', () => {
	it('lists only the published translations of the home page', () => {
		expect([...findPathTails([homeLink], '').keys()]).toEqual(['en', 'de']);
	});
});
