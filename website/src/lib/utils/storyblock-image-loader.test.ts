import storyblokImageLoader from './storyblock-image-loader';

describe('storyblokImageLoader', () => {
	const imageUrl = 'https://a.storyblok.com/f/123456/1200x800/program.jpg';

	it('builds a focal-point Storyblok image service URL when crop metadata is present', () => {
		const result = storyblokImageLoader({
			src: `${imageUrl}?_crop=100x120%3A300x320&_ratio=0.5263`,
			width: 760,
		});

		expect(result).toBe(
			'https://a.storyblok.com/f/123456/1200x800/program.jpg/m/760x400/filters:focal(100x120:300x320):format(webp)',
		);
	});

	it('keeps the smart crop fallback when no focal point is provided', () => {
		const result = storyblokImageLoader({
			src: `${imageUrl}?_crop=smart&_ratio=0.5263`,
			width: 760,
		});

		expect(result).toBe('https://a.storyblok.com/f/123456/1200x800/program.jpg/m/760x400/smart/filters:format(webp)');
	});
});
