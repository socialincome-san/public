import {
	clickToStoryblokFocus,
	focusToMarkerPosition,
	focusToObjectPosition,
	isValidStoryblokFocus,
	normalizeStoryblokFocusForImageService,
	parseStoryblokFocus,
	toStoryblokFocus,
} from './storyblok-image-focus';

describe('storyblok-image-focus', () => {
	it('converts coordinates to Storyblok focus format', () => {
		expect(toStoryblokFocus(380, 1154)).toBe('380x1154:381x1155');
	});

	it('parses valid Storyblok focus strings', () => {
		expect(parseStoryblokFocus('100x120:100x120')).toEqual({ x: 100, y: 120 });
		expect(parseStoryblokFocus('710x124:711x125')).toEqual({ x: 710, y: 124 });
	});

	it('rejects invalid focus strings', () => {
		expect(parseStoryblokFocus('invalid')).toBeNull();
		expect(parseStoryblokFocus('100x120:200x300')).toBeNull();
		expect(isValidStoryblokFocus('100x120:101x121')).toBe(true);
		expect(isValidStoryblokFocus('bad')).toBe(false);
	});

	it('normalizes legacy zero-size focus strings for the image service', () => {
		expect(normalizeStoryblokFocusForImageService('710x124:710x124')).toBe('710x124:711x125');
		expect(normalizeStoryblokFocusForImageService('710x124:711x125')).toBe('710x124:711x125');
	});

	it('maps focus to CSS object-position percentages', () => {
		expect(focusToObjectPosition('400x300:401x301', 800, 600)).toBe('50% 50%');
		expect(focusToObjectPosition('400x300:400x300', 800, 600)).toBe('50% 50%');
		expect(focusToObjectPosition(null, 800, 600)).toBe('50% 50%');
	});

	it('maps a centered click to image center coordinates', () => {
		const focus = clickToStoryblokFocus(160, 100, 320, 200, 800, 500);

		expect(parseStoryblokFocus(focus)).toEqual({ x: 400, y: 250 });
		expect(focus).toBe('400x250:401x251');
	});

	it('computes marker position from focus', () => {
		const marker = focusToMarkerPosition('400x250:401x251', 320, 200, 800, 500);

		expect(marker).toEqual({ x: 160, y: 100 });
	});
});
