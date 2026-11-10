import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import {
	formatArticleAuthorNames,
	formatStoryblokDateMedium,
	formatStoryblokResizeUrl,
	formatStoryblokUrl,
	getArticleAuthors,
	getPersonCircles,
	getScaledAssetDimensions,
	getStoryblokImageObjectPosition,
	getStoryblokMetadataImage,
	getTranslatedStoryName,
	getVolunteerDurationParts,
	isResolvedArticle,
	resolveStoryblokLink,
} from './storyblok-utils';

describe('Storyblok presentation utilities', () => {
	it('resolves unset internal links to a placeholder', () => {
		const link: StoryblokMultilink = {
			id: '',
			url: '',
			linktype: 'story',
			fieldtype: 'multilink',
			cached_url: '',
		};

		expect(resolveStoryblokLink(link, 'en', 'USD')).toBe('#');
	});

	it('annotates image URLs with crop and ratio metadata', () => {
		const imageUrl = 'https://a.storyblok.com/f/123456/1200x800/program.jpg';
		const focused = new URL(formatStoryblokUrl(imageUrl, 760, 400, '100x120:300x320'));
		const legacyFocus = new URL(formatStoryblokUrl(imageUrl, 760, 400, '710x124:710x124'));
		const smart = new URL(formatStoryblokUrl(imageUrl, 760, 400, null));
		const resized = new URL(formatStoryblokResizeUrl(imageUrl, 140, 93));

		expect(focused.searchParams.get('_crop')).toBe('100x120:300x320');
		expect(focused.searchParams.get('_ratio')).toBe('0.5263');
		expect(legacyFocus.searchParams.get('_crop')).toBe('710x124:711x125');
		expect(smart.searchParams.get('_crop')).toBe('smart');
		expect(resized.searchParams.get('_crop')).toBeNull();
		expect(resized.searchParams.get('_ratio')).toBe('0.6643');
	});

	it('scales dimensions from asset metadata', () => {
		expect(getScaledAssetDimensions({ filename: 'https://example.com/photo.jpg', width: 800, height: 600 }, 175)).toEqual({
			width: 175,
			height: 131,
		});
	});

	it('calculates CSS object-position from Storyblok image focus metadata', () => {
		const landscapeAsset = {
			filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg',
			focus: '300x200:301x201',
		};
		expect(getStoryblokImageObjectPosition(landscapeAsset)).toBe('25% 25%');

		const portraitAsset = {
			filename: 'https://a.storyblok.com/f/123456/800x1200/portrait.jpg',
			focus: '400x300:401x301',
		};
		expect(getStoryblokImageObjectPosition(portraitAsset)).toBe('50% 25%');

		const widescreenAsset = {
			filename: 'https://a.storyblok.com/f/123456/1920x1080/hero.jpg',
			focus: '960x540:961x541',
		};
		expect(getStoryblokImageObjectPosition(widescreenAsset)).toBe('50% 50%');

		const clampedAsset = {
			filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg',
			focus: '1500x1000:1501x1001',
		};
		expect(getStoryblokImageObjectPosition(clampedAsset)).toBe('100% 100%');
	});

	it('supports legacy zero-size focus metadata', () => {
		const asset = {
			filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg',
			focus: '600x400:600x400',
		};

		expect(getStoryblokImageObjectPosition(asset)).toBe('50% 50%');
	});

	it('returns fallback 50% 50% when focus metadata is malformed but filename has dimensions', () => {
		const asset = {
			filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg',
			focus: 'invalid',
		};

		expect(getStoryblokImageObjectPosition(asset)).toBe('50% 50%');
	});

	it('returns undefined when focus or filename is missing or unparseable', () => {
		expect(getStoryblokImageObjectPosition(null)).toBeUndefined();
		expect(getStoryblokImageObjectPosition(undefined)).toBeUndefined();
		expect(
			getStoryblokImageObjectPosition({ filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg' }),
		).toBeUndefined();
		expect(
			getStoryblokImageObjectPosition({ filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg', focus: null }),
		).toBeUndefined();
		expect(
			getStoryblokImageObjectPosition({ filename: 'https://a.storyblok.com/f/123456/1200x800/program.jpg', focus: '' }),
		).toBeUndefined();
		expect(
			getStoryblokImageObjectPosition({ filename: 'https://example.com/not-storyblok.jpg', focus: '100x100:101x101' }),
		).toBeUndefined();
	});
});

describe('Storyblok date utilities', () => {
	const parts = (date: string) => getVolunteerDurationParts(date, 'en', new Date(2026, 6, 26, 12).getTime());

	it.each([
		['2026-06-28', { unit: 'days', days: 28 }],
		['2026-07-25 22:00', { unit: 'days', days: 0 }],
		['2026-06-26', { unit: 'months', months: 1, isAnniversary: true }],
		['2026-04-26', { unit: 'months', months: 3, isAnniversary: true }],
		['2026-04-20', { unit: 'months', months: 3, isAnniversary: false }],
		['2025-07-26', { unit: 'years', years: 1, isAnniversary: true }],
		['2024-07-26', { unit: 'years', years: 2, isAnniversary: true }],
		['2025-04-26', { unit: 'years', years: 1, isAnniversary: false }],
		['2025-07-25', { unit: 'years', years: 1, isAnniversary: false }],
	])('calculates the duration for %s', (date, expected) => {
		expect(parts(date)).toEqual(expected);
	});

	it('rejects future and invalid dates', () => {
		expect(parts('2026-08-01')).toBeNull();
		expect(parts('not-a-date')).toBeNull();
	});

	it('restores UTC-shifted editor dates in the Storyblok timezone', () => {
		expect(parts('2026-06-25 22:00')).toEqual({ unit: 'months', months: 1, isAnniversary: true });
		expect(parts('2025-07-25 22:00')).toEqual({ unit: 'years', years: 1, isAnniversary: true });
		expect(parts('2026-01-25 23:00')).toEqual({ unit: 'months', months: 6, isAnniversary: true });
		expect(formatStoryblokDateMedium('2026-06-25 22:00', 'en')).toBe('Jun 26, 2026');
		expect(formatStoryblokDateMedium('2026-01-25 23:00', 'en')).toBe('Jan 26, 2026');
	});
});

describe('isResolvedArticle', () => {
	const person = { uuid: 'person-1', content: { firstName: 'Ada', lastName: 'Lovelace' } };
	const type = { uuid: 'type-1', content: { value: 'Essay' } };
	const tag = { uuid: 'tag-1', content: { value: 'Basic Income' } };
	const article = (author: unknown, articleType: unknown, tags?: unknown) => ({
		content: { author, type: articleType, tags },
	});

	it('accepts resolved required and optional relations', () => {
		expect(isResolvedArticle(article(person, type))).toBe(true);
		expect(isResolvedArticle(article(person, type, []))).toBe(true);
		expect(isResolvedArticle(article(person, type, [tag]))).toBe(true);
	});

	it('rejects unresolved UUID relations', () => {
		expect(isResolvedArticle(article('person-id', type))).toBe(false);
		expect(isResolvedArticle(article(person, 'type-id'))).toBe(false);
		expect(isResolvedArticle(article(person, type, [tag, 'tag-id']))).toBe(false);
	});
});

describe('article authors', () => {
	const person = (uuid: string, firstName: string, lastName: string) => ({
		uuid,
		content: { firstName, lastName, fullName: `${firstName} ${lastName}` },
	});
	const resolvedArticle = (coAuthors?: unknown[]) => {
		const story = { content: { author: person('ada', 'Ada', 'Lovelace'), type: { content: {} }, coAuthors } };
		if (!isResolvedArticle(story)) {
			throw new Error('Article fixture must be resolved');
		}

		return story.content;
	};

	it('lists the lead author first and skips unresolved co-authors', () => {
		const authors = getArticleAuthors(resolvedArticle([person('grace', 'Grace', 'Hopper'), 'unpublished-uuid']));

		expect(authors.map(({ uuid }) => uuid)).toEqual(['ada', 'grace']);
	});

	it('lists an author picked twice once', () => {
		const authors = getArticleAuthors(
			resolvedArticle([person('ada', 'Ada', 'Lovelace'), person('grace', 'Grace', 'Hopper')]),
		);

		expect(authors.map(({ uuid }) => uuid)).toEqual(['ada', 'grace']);
	});

	it('uses the full name for a single author and first names for several', () => {
		const single = getArticleAuthors(resolvedArticle());
		const several = getArticleAuthors(
			resolvedArticle([person('grace', 'Grace', 'Hopper'), person('alan', 'Alan', 'Turing')]),
		);

		expect(formatArticleAuthorNames(single, 'en')).toBe('Ada Lovelace');
		expect(formatArticleAuthorNames(several, 'en')).toBe('Ada, Grace, and Alan');
		expect(formatArticleAuthorNames(several, 'de')).toBe('Ada, Grace und Alan');
	});

	it('uses full names when co-authors share a first name', () => {
		const authors = getArticleAuthors(resolvedArticle([person('ada-byron', 'Ada', 'Byron')]));

		expect(formatArticleAuthorNames(authors, 'en')).toBe('Ada Lovelace and Ada Byron');
	});
});

describe('getPersonCircles', () => {
	it('lists active circles first and keeps a circle that is both active and interested once', () => {
		expect(
			getPersonCircles(
				{ activeCircleMember: ['tech-circle'], interestedCircleMember: ['tech-circle', 'partnership-circle'] },
				{ 'tech-circle': 'tech-circle' },
			),
		).toEqual([
			{ code: 'tech-circle', label: 'Tech Circle', status: 'active' },
			{ code: 'partnership-circle', label: 'Partnership Circle', status: 'interested' },
		]);
	});

	it('keeps translated labels as they are', () => {
		expect(getPersonCircles({ activeCircleMember: ['lead-team'] }, { 'lead-team': 'Lead-Team' })).toEqual([
			{ code: 'lead-team', label: 'Lead-Team', status: 'active' },
		]);
	});
});

describe('getStoryblokMetadataImage', () => {
	it('crops Storyblok assets to 1200×630', () => {
		expect(
			getStoryblokMetadataImage({ filename: 'https://a.storyblok.com/f/1/3000x2000/abc/hero.jpg', alt: 'Hero' }),
		).toEqual({
			url: 'https://a.storyblok.com/f/1/3000x2000/abc/hero.jpg/m/1200x630/smart',
			width: 1200,
			height: 630,
			alt: 'Hero',
		});
	});

	it('uses external images as they are', () => {
		expect(getStoryblokMetadataImage({ filename: 'https://images.example.org/hero.jpg' }, 'Title')).toEqual({
			url: 'https://images.example.org/hero.jpg',
			alt: 'Title',
		});
	});

	it('returns nothing without an image, so the default of the language applies', () => {
		expect(getStoryblokMetadataImage({ filename: '' })).toBeUndefined();
	});
});

describe('getTranslatedStoryName', () => {
	const story = {
		name: 'Donate',
		translated_slugs: [
			{ path: 'pages/donate', lang: 'de', name: 'Spenden' },
			{ path: 'pages/donate', lang: 'fr', name: null },
		],
	};

	it('returns the name for the language', () => {
		expect(getTranslatedStoryName(story, 'de')).toBe('Spenden');
	});

	it('falls back to the default name without a translation', () => {
		expect(getTranslatedStoryName(story, 'fr')).toBe('Donate');
		expect(getTranslatedStoryName(story, 'it')).toBe('Donate');
		expect(getTranslatedStoryName({ name: 'Donate' }, 'de')).toBe('Donate');
	});
});
