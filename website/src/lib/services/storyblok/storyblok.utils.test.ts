import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokResizeUrl, formatStoryblokUrl, getScaledAssetDimensions, resolveStoryblokLink } from './storyblok.utils';

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

describe('formatStoryblokUrl', () => {
	const imageUrl = 'https://a.storyblok.com/f/123456/1200x800/program.jpg';

	it('annotates Storyblok image URLs with focal point crop data', () => {
		const result = formatStoryblokUrl(imageUrl, 760, 400, '100x120:300x320');
		const url = new URL(result);

		expect(url.searchParams.get('_crop')).toBe('100x120:300x320');
		expect(url.searchParams.get('_ratio')).toBe('0.5263');
	});

	it('uses smart crop metadata when no focal point is provided', () => {
		const result = formatStoryblokUrl(imageUrl, 760, 400, null);
		const url = new URL(result);

		expect(url.searchParams.get('_crop')).toBe('smart');
		expect(url.searchParams.get('_ratio')).toBe('0.5263');
	});
});

describe('getScaledAssetDimensions', () => {
	it('scales dimensions from the asset metadata when the URL has no dimensions', () => {
		const result = getScaledAssetDimensions(
			{ filename: 'https://example.com/photo.jpg', width: 800, height: 600 },
			175,
		);

		expect(result).toEqual({ width: 175, height: 131 });
	});
});

describe('formatStoryblokResizeUrl', () => {
	it('annotates Storyblok image URLs with aspect ratio only', () => {
		const result = formatStoryblokResizeUrl('https://a.storyblok.com/f/123456/1200x800/program.jpg', 140, 93);
		const url = new URL(result);

		expect(url.searchParams.get('_crop')).toBeNull();
		expect(url.searchParams.get('_ratio')).toBe('0.6643');
	});
});
