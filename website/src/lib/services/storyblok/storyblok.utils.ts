import type { Article, ArticleType, Person, Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok.d.ts';
import { defaultLanguage } from '@/lib/i18n/utils';
import {
	getWebsitePathTailFromStoryblokSlug,
	getWebsitePublicPath,
	WEBSITE_PERSON_PATH_SEGMENT,
} from '@/lib/storyblok/storyblok-paths';
import {
	DEFAULT_OPEN_GRAPH_IMAGE_URL,
	DEFAULT_TWITTER_IMAGE_URL,
	toProductionMetadataImage,
	type MetadataImage,
} from '@/lib/utils/metadata';
import { humanizeIdentifier } from '@/lib/utils/string-utils';
import type { ISbStoryData } from '@storyblok/js';
import { DateTime } from 'luxon';
import type { Metadata } from 'next';

// Helper type to remove index signature from a type
type RemoveIndexSignature<T> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

/**
 * Normalizes a Storyblok field value into a clean string array — handles a single value, an
 * array, or empty/undefined, which covers a field mid-migration from single-select to multi-select.
 */
export const toStringArray = (value: string | number | (string | number)[] | undefined): string[] => {
	const list = Array.isArray(value) ? value : value !== undefined ? [value] : [];

	return list.map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry))).filter(Boolean);
};

export type ResolvedArticle = Omit<RemoveIndexSignature<Article>, 'author' | 'type' | 'tags'> & {
	author: ISbStoryData<Person>;
	type: ISbStoryData<ArticleType>;
	tags?: ISbStoryData<Tag>[];
};

export const getArticleTitle = (article: ISbStoryData<ResolvedArticle>, includeSubtitle = false) => {
	if (!includeSubtitle) {
		return article.content.title;
	}

	const subtitle = article.content.subtitle?.trim();

	return subtitle ? `${article.content.title} ${subtitle}` : article.content.title;
};

const PERSON_AVATAR_SIZE = 300;

export const getPersonDisplayName = (person: ISbStoryData<Person>) =>
	`${person.content.firstName} ${person.content.lastName}`.trim() || person.content.fullName;

export const getPersonAvatarSrc = (person: ISbStoryData<Person>) => {
	const filename = person.content.avatar?.filename;
	if (!filename) {
		return null;
	}

	return formatStoryblokUrl(filename, PERSON_AVATAR_SIZE, PERSON_AVATAR_SIZE, person.content.avatar.focus);
};

export const getPersonLinkedInUrl = (handle: string) => `https://www.linkedin.com/in/${encodeURIComponent(handle)}`;

export const getPersonGitHubUrl = (username: string) => `https://github.com/${encodeURIComponent(username)}`;

/**
 * Normalizes a Person.primaryRole value to its string code — Storyblok option fields can hold a
 * numeric datasource id as well as a string value. Returns '' when the role is unset.
 */
export const getRoleCode = (role: Person['primaryRole']): string =>
	role === undefined || role === null ? '' : String(role).trim();

/**
 * Display label for a Person.primaryRole value: the datasource label when available,
 * a humanized version of the stored value otherwise. Returns '' for an unset role.
 */
export const getRoleLabel = (role: Person['primaryRole'], roleLabels?: Record<string, string>): string => {
	const code = getRoleCode(role);
	if (!code) {
		return '';
	}

	return roleLabels?.[code] ?? humanizeIdentifier(code);
};

export const personHasRole = (person: ISbStoryData<Person>, roleCodes: string[]): boolean => {
	const code = getRoleCode(person.content.primaryRole);

	return code.length > 0 && roleCodes.includes(code);
};

// ==================== Image Utilities ====================

/**
 * Extract dimensions from a Storyblok image URL.
 * Based on official documentation: https://www.storyblok.com/faq/image-dimensions-assets-js
 * Format example: https://a.storyblok.com/f/51376/664x488/f4f9d1769c/visual-editor-features.jpg
 */
export const getDimensionsFromStoryblokImageUrl = (url: string): { width?: number; height?: number } => {
	if (!url) {
		return {};
	}
	const match = /\/f\/\d+\/(\d+)x(\d+)\//.exec(url);

	return match ? { width: Number(match[1]), height: Number(match[2]) } : {};
};

/**
 * Calculate scaled dimensions maintaining aspect ratio.
 */
export const getScaledDimensions = (url: string, maxWidth: number): { width: number; height: number } | null => {
	const original = getDimensionsFromStoryblokImageUrl(url);
	if (!original.width || !original.height) {
		return null;
	}

	if (original.width <= maxWidth) {
		return { width: original.width, height: original.height };
	}

	return {
		width: maxWidth,
		height: Math.round((original.height / original.width) * maxWidth),
	};
};

type ScalableStoryblokAsset = {
	filename: string;
	width?: number | null;
	height?: number | null;
};

/**
 * Resolve display dimensions from a Storyblok asset URL, falling back to asset metadata.
 */
export const getScaledAssetDimensions = (
	asset: ScalableStoryblokAsset,
	maxWidth: number,
): { width: number; height: number } => {
	const fromUrl = getScaledDimensions(asset.filename, maxWidth);
	if (fromUrl) {
		return fromUrl;
	}

	if (asset.width && asset.height) {
		if (asset.width <= maxWidth) {
			return { width: asset.width, height: asset.height };
		}

		return {
			width: maxWidth,
			height: Math.round((asset.height / asset.width) * maxWidth),
		};
	}

	return { width: maxWidth, height: maxWidth };
};

/**
 * Annotates a Storyblok image URL with focal point or smart cropping metadata.
 * The actual image transformation is handled by the custom image loader.
 * Official documentation: https://www.storyblok.com/faq/use-focal-point-set-in-storyblok
 */
export const formatStoryblokUrl = (url: string, width: number, height: number, focus?: string | null) => {
	const crop = focus ?? 'smart';
	const ratio = width > 0 && height > 0 ? (height / width).toFixed(4) : '0';

	return `${url}?_crop=${encodeURIComponent(crop)}&_ratio=${ratio}`;
};

/**
 * Annotates a Storyblok image URL with aspect ratio only (no cropping).
 * Use for images that should keep their full frame at the target aspect ratio.
 */
export const formatStoryblokResizeUrl = (url: string, width: number, height: number) => {
	const ratio = width > 0 && height > 0 ? (height / width).toFixed(4) : '0';

	return `${url}?_ratio=${ratio}`;
};

/**
 * Builds a complete Storyblok Image Service URL for direct usage (e.g., OG metadata).
 * Unlike formatStoryblokUrl, this returns a URL that can be fetched directly without
 * going through the Next.js image loader.
 */
export const formatStoryblokUrlDirect = (url: string, width: number, height: number, focus?: string | null) => {
	let imageSource = url + `/m/${width}x${height}`;
	imageSource += focus ? `/filters:focal(${focus})` : '/smart';

	return imageSource;
};

// ==================== Date Utilities ====================

/**
 * Parse a Storyblok date string into a DateTime object.
 * Storyblok returns date fields in the following format "yyyy-MM-dd HH:mm" without timezone.
 * Nevertheless, the fields `first_published_at` and 'published_at' are returned in proper ISO8601 format.
 *
 * Those naive strings hold the editor's input already converted to UTC, so the date part alone is a
 * day early for anything entered at midnight: picking 26 June in the CMS is stored as
 * "2026-06-25 22:00". Reading the instant back in the space timezone restores the entered date.
 */
const STORYBLOK_SPACE_TIMEZONE = 'Europe/Zurich';

const toDateObject = (date: string, lang: string) => {
	let dateObject = DateTime.fromISO(date, { zone: 'utc' });
	if (!dateObject.isValid) {
		dateObject = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: 'utc' });
	}

	return dateObject.setZone(STORYBLOK_SPACE_TIMEZONE).setLocale(lang);
};

/**
 * Format a Storyblok date for display.
 */
export const formatStoryblokDate = (date: string | null | undefined, lang: string) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, lang);

	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
};

/**
 * Locale-aware medium date, e.g. "Aug 2, 2023" (en) / "2. Aug. 2023" (de) / "2 août 2023" (fr).
 */
export const formatStoryblokDateMedium = (date: string | null | undefined, lang: string) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, lang);

	return dateObject.isValid ? dateObject.toLocaleString(DateTime.DATE_MED) : '';
};

export type VolunteerDurationParts =
	| { unit: 'days'; days: number }
	// `isAnniversary` marks the exact day a whole month (first year only) or whole year is reached,
	// which callers celebrate with their own wording instead of the running total.
	| { unit: 'months'; months: number; isAnniversary: boolean }
	| { unit: 'years'; years: number; isAnniversary: boolean };

/**
 * Breaks the time elapsed since a Storyblok date field into day/month/year buckets, for callers
 * that render it in their own words (e.g. localized duration labels).
 */
export const getVolunteerDurationParts = (date: string | null | undefined, lang: string): VolunteerDurationParts | null => {
	if (!date) {
		return null;
	}
	const dateObject = toDateObject(date, lang);
	if (!dateObject.isValid) {
		return null;
	}

	// Both operands are pinned to midnight in the space timezone: the diff then lands on whole days,
	// and server and viewer agree on "today" (this also renders inside the client-side person grid).
	const start = dateObject.startOf('day');
	const today = DateTime.now().setZone(STORYBLOK_SPACE_TIMEZONE).startOf('day');

	const totalDays = Math.floor(today.diff(start, 'days').days);
	if (totalDays < 0) {
		return null;
	}

	const { years, months, days } = today.diff(start, ['years', 'months', 'days']).toObject();
	const wholeYears = Math.floor(years ?? 0);
	const wholeMonths = Math.floor(months ?? 0);
	const remainderDays = Math.floor(days ?? 0);
	const totalMonths = wholeYears * 12 + wholeMonths;

	if (totalMonths < 1) {
		return { unit: 'days', days: totalDays };
	}

	if (totalMonths < 12) {
		return { unit: 'months', months: totalMonths, isAnniversary: remainderDays === 0 };
	}

	return { unit: 'years', years: wholeYears, isAnniversary: wholeMonths === 0 && remainderDays === 0 };
};

/**
 * Format a Storyblok date to ISO format.
 */
const formatStoryblokDateToIso = (date: string | null | undefined) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, defaultLanguage);

	return dateObject.isValid ? dateObject.toISO() : '';
};

// ==================== URL Utilities ====================

const createWebsitePath = (lang: string, region: string, ...segments: string[]) => {
	const pathTail = segments.join('/');

	return `/${lang}/${region}${pathTail ? `/${pathTail}` : ''}`;
};

export const createWebsiteJournalPath = (lang: string, region: string) => createWebsitePath(lang, region, 'journal');

export const createWebsiteJournalArticleLink = (slug: string, lang: string, region: string) =>
	createWebsitePath(lang, region, 'journal', slug);

export const createWebsiteJournalTagLink = (tagSlug: string, lang: string, region: string) =>
	`${createWebsiteJournalPath(lang, region)}?tag=${encodeURIComponent(tagSlug)}`;

export const createWebsitePersonLink = (slug: string, lang: string, region: string) =>
	createWebsitePath(lang, region, WEBSITE_PERSON_PATH_SEGMENT, slug);

export const createWebsiteJournalArticleCanonicalUrl = (slug: string, lang: string) =>
	`https://socialincome.org/${lang}/journal/${slug}`;

/**
 * Resolve a StoryblokMultilink to a URL string.
 * Handles both external URLs (linktype 'url') and internal story links (linktype 'story').
 */
export const resolveStoryblokLink = (link: StoryblokMultilink | undefined, lang: string, region: string): string => {
	if (!link) {
		return '#';
	}

	if (link.linktype === 'url') {
		return link.url || '#';
	}

	if (link.linktype === 'story') {
		// cached_url is the Storyblok full_slug, e.g. "pages/about"
		const cachedUrlRaw = link.cached_url?.trim() ?? '';

		if (!cachedUrlRaw) {
			return '#';
		}

		const cachedUrlWithoutLeadingSlashes = cachedUrlRaw.replace(/^\/+/, '');
		const cachedUrlWithoutLangPrefix =
			cachedUrlWithoutLeadingSlashes.toLowerCase() === lang.toLowerCase()
				? ''
				: cachedUrlWithoutLeadingSlashes.replace(new RegExp(`^${lang}/`, 'i'), '');

		const websitePathTail = getWebsitePathTailFromStoryblokSlug(cachedUrlWithoutLangPrefix);

		return getWebsitePublicPath(lang, region, websitePathTail);
	}

	return '#';
};

// ==================== Metadata Utilities ====================

/**
 * Generate Next.js Metadata for a Storyblok article.
 */
export const generateMetaDataForArticle = (storyblokStory: ISbStoryData<ResolvedArticle>, url: string): Metadata => {
	const storyblokArticle = storyblokStory.content;
	const title = storyblokArticle.title;
	const description = storyblokArticle.leadText;
	const authorsFullName = `${storyblokArticle.author.content.firstName} ${storyblokArticle.author.content.lastName}`;
	const imageFilename = storyblokArticle.image?.filename;
	const tags = storyblokArticle.tags?.map((it) => it.content.value).join(', ');

	let imageMetaData: MetadataImage | undefined;
	if (imageFilename) {
		try {
			const dimensions = getDimensionsFromStoryblokImageUrl(imageFilename);
			if (dimensions.width && dimensions.height) {
				// Use direct URL for OG metadata since it doesn't go through the Next.js image loader
				const imageUrl = formatStoryblokUrlDirect(
					imageFilename,
					dimensions.width,
					dimensions.height,
					storyblokArticle.image.focus ?? undefined,
				);
				imageMetaData = {
					url: imageUrl,
					width: dimensions.width,
					height: dimensions.height,
				};
			}
		} catch {
			imageMetaData = undefined;
		}
	}

	const openGraphImages = toProductionMetadataImage(imageMetaData, DEFAULT_OPEN_GRAPH_IMAGE_URL);
	const twitterImages = toProductionMetadataImage(imageMetaData, DEFAULT_TWITTER_IMAGE_URL);

	return {
		title: title,
		description: description,
		keywords: tags,
		authors: { name: authorsFullName },
		openGraph: {
			title: title,
			description: description,
			images: openGraphImages,
			url: url,
			type: 'article',
		},
		twitter: {
			title: title,
			description: description,
			images: twitterImages,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
		},
		other: {
			'article:published_time': formatStoryblokDateToIso(storyblokStory.first_published_at),
			'article:modified_time': formatStoryblokDateToIso(storyblokStory.updated_at),
			'article:author': authorsFullName,
			'article:section': 'News',
			...(tags && { 'article:tag': tags }),
		},
	};
};
