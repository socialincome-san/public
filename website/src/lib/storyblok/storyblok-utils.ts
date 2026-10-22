import type { ArticleType, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok.d.ts';
import { defaultCurrency, defaultLanguage, getWebsiteBasePath, type WebsiteCurrency } from '@/lib/i18n/utils';
import { DEFAULT_OPEN_GRAPH_IMAGE_URL, toProductionMetadataImage, WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';
import { humanizeIdentifier } from '@/lib/utils/string-utils';
import type { ISbStoryData } from '@storyblok/js';
import { DateTime } from 'luxon';
import type { Metadata } from 'next';
import type { ResolvedArticle } from './storyblok-article';
import { normalizeStoryblokFocusForImageService } from './storyblok-image-focus';
import {
	getWebsitePathTailFromStoryblokSlug,
	getWebsitePublicPath,
	WEBSITE_PEOPLE_PATH_SEGMENT,
	WEBSITE_PERSON_PATH_SEGMENT,
} from './storyblok-paths';

export const toStringArray = (value: string | number | (string | number)[] | undefined): string[] => {
	const list = Array.isArray(value) ? value : value !== undefined ? [value] : [];

	return list.map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry))).filter(Boolean);
};

const isResolvedRelation = (value: unknown): value is ISbStoryData =>
	typeof value === 'object' &&
	value !== null &&
	'content' in value &&
	typeof value.content === 'object' &&
	value.content !== null;

export const isResolvedArticle = (story: unknown): story is ISbStoryData<ResolvedArticle> => {
	if (!isResolvedRelation(story) || !isResolvedRelation(story.content.author) || !isResolvedRelation(story.content.type)) {
		return false;
	}
	const { tags } = story.content;

	return tags === undefined || tags === null || (Array.isArray(tags) && tags.every(isResolvedRelation));
};

export const getArticleTitle = (article: ISbStoryData<ResolvedArticle>) => article.content.title;

export const getArticleTypeLabel = (articleType: ISbStoryData<ArticleType>) => {
	const value = articleType.content?.value?.trim();
	if (value) {
		return value;
	}

	return articleType.name;
};

export const getPersonDisplayName = (person: ISbStoryData<Person>) =>
	`${person.content.firstName} ${person.content.lastName}`.trim() || person.content.fullName;

export const getPersonAvatarSrc = (person: ISbStoryData<Person>) => {
	const filename = person.content.avatar?.filename;

	return filename ? formatStoryblokUrl(filename, 300, 300, person.content.avatar.focus) : null;
};

export const getPersonLinkedInUrl = (handle: string) => `https://www.linkedin.com/in/${encodeURIComponent(handle)}`;

export const getPersonGitHubUrl = (username: string) => `https://github.com/${encodeURIComponent(username)}`;

// Storyblok option fields can hold a numeric datasource id as well as a string value
export const getOptionCode = (value: string | number | undefined | null): string =>
	value === undefined || value === null ? '' : String(value).trim();

export const getRoleCode = (role: Person['primaryRole']): string => getOptionCode(role);

export const getRoleLabel = (role: Person['primaryRole'], roleLabels?: Record<string, string>): string => {
	const code = getRoleCode(role);

	return code ? (roleLabels?.[code] ?? humanizeIdentifier(code)) : '';
};

export const personHasRole = (person: ISbStoryData<Person>, roleCodes: string[]): boolean => {
	const code = getRoleCode(person.content.primaryRole);

	return code.length > 0 && roleCodes.includes(code);
};

export type PersonCircle = {
	code: string;
	label: string;
	status: 'active' | 'interested';
};

// Untranslated `circles` datasource entries are labelled with the circle slug (e.g. "partnership-circle")
const getCircleLabel = (code: string, circleLabels?: Record<string, string>): string => {
	const label = circleLabels?.[code] ?? code;

	return label === code ? humanizeIdentifier(code) : label;
};

// Active memberships first; a circle listed as both active and interested is kept once, as active
export const getPersonCircles = (
	{ activeCircleMember, interestedCircleMember }: Pick<Person, 'activeCircleMember' | 'interestedCircleMember'>,
	circleLabels?: Record<string, string>,
): PersonCircle[] => {
	const activeCodes = toStringArray(activeCircleMember);
	const activeCodeSet = new Set(activeCodes);
	const interestedCodes = toStringArray(interestedCircleMember).filter((code) => !activeCodeSet.has(code));

	return [
		...activeCodes.map((code) => ({ code, label: getCircleLabel(code, circleLabels), status: 'active' as const })),
		...interestedCodes.map((code) => ({ code, label: getCircleLabel(code, circleLabels), status: 'interested' as const })),
	];
};

export const getDimensionsFromStoryblokImageUrl = (url: string): { width?: number; height?: number } => {
	const match = /\/f\/\d+\/(\d+)x(\d+)\//.exec(url);

	return match ? { width: Number(match[1]), height: Number(match[2]) } : {};
};

export const getScaledDimensions = (url: string, maxWidth: number): { width: number; height: number } | null => {
	const original = getDimensionsFromStoryblokImageUrl(url);
	if (!original.width || !original.height) {
		return null;
	}
	if (original.width <= maxWidth) {
		return { width: original.width, height: original.height };
	}

	return { width: maxWidth, height: Math.round((original.height / original.width) * maxWidth) };
};

type ScalableStoryblokAsset = {
	filename: string;
	width?: number | null;
	height?: number | null;
};

export const getScaledAssetDimensions = (
	asset: ScalableStoryblokAsset,
	maxWidth: number,
): { width: number; height: number } => {
	const fromUrl = getScaledDimensions(asset.filename, maxWidth);
	if (fromUrl) {
		return fromUrl;
	}
	if (asset.width && asset.height) {
		return asset.width <= maxWidth
			? { width: asset.width, height: asset.height }
			: { width: maxWidth, height: Math.round((asset.height / asset.width) * maxWidth) };
	}

	return { width: maxWidth, height: maxWidth };
};

export const formatStoryblokUrl = (url: string, width: number, height: number, focus?: string | null) => {
	const crop = focus ? normalizeStoryblokFocusForImageService(focus) : 'smart';
	const ratio = width > 0 && height > 0 ? (height / width).toFixed(4) : '0';

	return `${url}?_crop=${encodeURIComponent(crop)}&_ratio=${ratio}`;
};

export const formatStoryblokResizeUrl = (url: string, width: number, height: number) => {
	const ratio = width > 0 && height > 0 ? (height / width).toFixed(4) : '0';

	return `${url}?_ratio=${ratio}`;
};

export const formatStoryblokUrlDirect = (url: string, width: number, height: number, focus?: string | null) =>
	`${url}/m/${width}x${height}${focus ? `/filters:focal(${normalizeStoryblokFocusForImageService(focus)})` : '/smart'}`;

const STORYBLOK_SPACE_TIMEZONE = 'Europe/Zurich';

const DATE_TIME_WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

// Luxon's parsers read the current time, which prerendering rejects outside a cache, so parse to a timestamp first.
const toDateObject = (date: string, language: string) => {
	const timestamp = Date.parse(DATE_TIME_WITHOUT_OFFSET.test(date) ? `${date.replace(' ', 'T')}Z` : date);

	return Number.isNaN(timestamp)
		? DateTime.invalid('unparsable')
		: DateTime.fromMillis(timestamp, { zone: STORYBLOK_SPACE_TIMEZONE, locale: language });
};

export const formatStoryblokDate = (date: string | null | undefined, language: string) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, language);

	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
};

export const formatStoryblokDateMedium = (date: string | null | undefined, language: string) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, language);

	return dateObject.isValid ? dateObject.toLocaleString(DateTime.DATE_MED) : '';
};

export type VolunteerDurationParts =
	| { unit: 'days'; days: number }
	| { unit: 'months'; months: number; isAnniversary: boolean }
	| { unit: 'years'; years: number; isAnniversary: boolean };

export const getVolunteerDurationParts = (
	date: string | null | undefined,
	language: string,
	todayMs: number,
): VolunteerDurationParts | null => {
	if (!date) {
		return null;
	}
	const dateObject = toDateObject(date, language);
	if (!dateObject.isValid) {
		return null;
	}
	const start = dateObject.startOf('day');
	const today = DateTime.fromMillis(todayMs, { zone: STORYBLOK_SPACE_TIMEZONE }).startOf('day');
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

const formatStoryblokDateToIso = (date: string | null | undefined) => {
	if (!date) {
		return '';
	}
	const dateObject = toDateObject(date, defaultLanguage);

	return dateObject.isValid ? dateObject.toISO() : '';
};

const createWebsitePath = (language: string, currency: WebsiteCurrency, ...segments: string[]) => {
	const pathTail = segments.join('/');

	return `${getWebsiteBasePath(language, currency)}${pathTail ? `/${pathTail}` : ''}`;
};

export const createWebsiteJournalPath = (language: string, currency: WebsiteCurrency) =>
	createWebsitePath(language, currency, 'journal');

export const createWebsiteJournalArticleLink = (slug: string, language: string, currency: WebsiteCurrency) =>
	createWebsitePath(language, currency, 'journal', slug);

export const createWebsiteJournalTagLink = (tagSlug: string, language: string, currency: WebsiteCurrency) =>
	`${createWebsiteJournalPath(language, currency)}?tag=${encodeURIComponent(tagSlug)}`;

export const createWebsiteJournalArticleTypeLink = (articleTypeSlug: string, language: string, currency: WebsiteCurrency) =>
	`${createWebsiteJournalPath(language, currency)}?type=${encodeURIComponent(articleTypeSlug)}`;

export const createWebsitePersonLink = (slug: string, language: string, currency: WebsiteCurrency) =>
	createWebsitePath(language, currency, WEBSITE_PERSON_PATH_SEGMENT, slug);

export const createWebsitePeoplePath = (language: string, currency: WebsiteCurrency) =>
	createWebsitePath(language, currency, WEBSITE_PEOPLE_PATH_SEGMENT);

export const createWebsiteJournalArticleCanonicalUrl = (slug: string, language: string) =>
	`${WEBSITE_ORIGIN}${getWebsiteBasePath(language, defaultCurrency)}/journal/${slug}`;

export const resolveStoryblokLink = (
	link: StoryblokMultilink | undefined,
	language: string,
	currency: WebsiteCurrency,
): string => {
	if (!link) {
		return '#';
	}
	if (link.linktype === 'url') {
		return link.url || '#';
	}
	if (link.linktype !== 'story') {
		return '#';
	}
	const cachedUrl = link.cached_url?.trim().replace(/^\/+/, '') ?? '';
	if (!cachedUrl) {
		return '#';
	}
	const withoutLanguage =
		cachedUrl.toLowerCase() === language.toLowerCase() ? '' : cachedUrl.replace(new RegExp(`^${language}/`, 'i'), '');

	return getWebsitePublicPath(language, currency, getWebsitePathTailFromStoryblokSlug(withoutLanguage));
};

export const generateMetaDataForArticle = (story: ISbStoryData<ResolvedArticle>, url: string): Metadata => {
	const article = story.content;
	const authorsFullName = `${article.author.content.firstName} ${article.author.content.lastName}`;
	const imageFilename = article.image?.filename;
	const tags = article.tags?.map((tag) => tag.content.value).join(', ');
	const dimensions = imageFilename ? getDimensionsFromStoryblokImageUrl(imageFilename) : {};
	const imageMetaData =
		imageFilename && dimensions.width && dimensions.height
			? {
					url: formatStoryblokUrlDirect(
						imageFilename,
						dimensions.width,
						dimensions.height,
						article.image.focus ?? undefined,
					),
					width: dimensions.width,
					height: dimensions.height,
				}
			: undefined;
	const metadataImage = toProductionMetadataImage(imageMetaData, DEFAULT_OPEN_GRAPH_IMAGE_URL);

	return {
		title: article.title,
		description: article.leadText,
		keywords: tags,
		authors: { name: authorsFullName },
		openGraph: {
			title: article.title,
			description: article.leadText,
			images: metadataImage,
			url,
			type: 'article',
		},
		twitter: {
			title: article.title,
			description: article.leadText,
			images: metadataImage,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
		},
		other: {
			'article:published_time': formatStoryblokDateToIso(story.first_published_at),
			'article:modified_time': formatStoryblokDateToIso(story.updated_at),
			'article:author': authorsFullName,
			'article:section': 'News',
			...(tags ? { 'article:tag': tags } : {}),
		},
	};
};
