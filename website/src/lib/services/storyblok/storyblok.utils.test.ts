import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import {
	formatStoryblokDateMedium,
	formatStoryblokResizeUrl,
	formatStoryblokUrl,
	getScaledAssetDimensions,
	getVolunteerDurationParts,
	resolveStoryblokLink,
} from './storyblok.utils';

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

	it('normalizes legacy zero-size focus strings for the image service', () => {
		const result = formatStoryblokUrl(imageUrl, 760, 400, '710x124:710x124');
		const url = new URL(result);

		expect(url.searchParams.get('_crop')).toBe('710x124:711x125');
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
		const result = getScaledAssetDimensions({ filename: 'https://example.com/photo.jpg', width: 800, height: 600 }, 175);

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

describe('getVolunteerDurationParts', () => {
	// Local noon, so the local-midnight normalization can't drift across a day boundary.
	beforeAll(() => {
		jest.useFakeTimers().setSystemTime(new Date(2026, 6, 26, 12));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	const parts = (date: string) => getVolunteerDurationParts(date, 'en');

	it('reports whole days below the first full month', () => {
		expect(parts('2026-06-28')).toEqual({ unit: 'days', days: 28 });
	});

	// Day zero drives the standalone "Started today" label rather than a "0 days" count.
	it('reports zero days for a start date of today', () => {
		expect(parts('2026-07-25 22:00')).toEqual({ unit: 'days', days: 0 });
	});

	it('never reports zero months once it switches away from days', () => {
		expect(parts('2026-06-26')).toEqual({ unit: 'months', months: 1, isAnniversary: true });
	});

	it('flags a whole-month anniversary within the first year', () => {
		expect(parts('2026-04-26')).toEqual({ unit: 'months', months: 3, isAnniversary: true });
	});

	it('does not flag a partial month', () => {
		expect(parts('2026-04-20')).toEqual({ unit: 'months', months: 3, isAnniversary: false });
	});

	it('flags a whole-year anniversary', () => {
		expect(parts('2025-07-26')).toEqual({ unit: 'years', years: 1, isAnniversary: true });
		expect(parts('2024-07-26')).toEqual({ unit: 'years', years: 2, isAnniversary: true });
	});

	it('drops the trailing months once past a year', () => {
		expect(parts('2025-04-26')).toEqual({ unit: 'years', years: 1, isAnniversary: false });
	});

	it('does not flag the day after an anniversary', () => {
		expect(parts('2025-07-25')).toEqual({ unit: 'years', years: 1, isAnniversary: false });
	});

	it('ignores future and unparseable dates', () => {
		expect(parts('2026-08-01')).toBeNull();
		expect(parts('not-a-date')).toBeNull();
	});

	// Storyblok stores the editor's midnight already converted to UTC, so the raw date part is a day
	// early: "26 June" entered in the CMS arrives as "2026-06-25 22:00" (summer) / "23:00" (winter).
	it('reads the entered day back out of a UTC-shifted Storyblok datetime', () => {
		expect(parts('2026-06-25 22:00')).toEqual({ unit: 'months', months: 1, isAnniversary: true });
		expect(parts('2025-07-25 22:00')).toEqual({ unit: 'years', years: 1, isAnniversary: true });
		expect(parts('2026-01-25 23:00')).toEqual({ unit: 'months', months: 6, isAnniversary: true });
	});
});

describe('formatStoryblokDateMedium', () => {
	it('shows the day the editor entered, not the UTC-shifted one', () => {
		expect(formatStoryblokDateMedium('2026-06-25 22:00', 'en')).toBe('Jun 26, 2026');
		expect(formatStoryblokDateMedium('2026-01-25 23:00', 'en')).toBe('Jan 26, 2026');
	});
});
