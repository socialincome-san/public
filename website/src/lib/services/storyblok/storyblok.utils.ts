import type { Article, ArticleType, Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { ISbStoryData } from '@storyblok/js';
import { DateTime } from 'luxon';
import { Metadata } from 'next';

// Helper type to remove index signature from a type
type RemoveIndexSignature<T> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

export type ResolvedArticle = Omit<RemoveIndexSignature<Article>, 'author' | 'type' | 'tags'> & {
	author: ISbStoryData<Author>;
	type: ISbStoryData<ArticleType>;
	tags?: ISbStoryData<Topic>[];
};

// ==================== Image Utilities ====================

/**
 * Extract dimensions from a Storyblok image URL.
 * Based on official documentation: https://www.storyblok.com/faq/image-dimensions-assets-js
 * Format example: https://a.storyblok.com/f/51376/664x488/f4f9d1769c/visual-editor-features.jpg
 */
export function getDimensionsFromStoryblokImageUrl(url: string): { width?: number; height?: number } {
	if (!url) {
		return {};
	}
	const match = url.match(/\/f\/\d+\/(\d+)x(\d+)\//);

	return match ? { width: Number(match[1]), height: Number(match[2]) } : {};
}

/**
 * Calculate scaled dimensions maintaining aspect ratio.
 */
export function getScaledDimensions(url: string, maxWidth: number): { width: number; height: number } | null {
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
}

/**
 * Format a Storyblok image URL with optional focal point.
 * Storyblok provides out of the box image resizing/cropping, which can be combined with a custom focal point.
 * If that's not defined, we use the smart feature, which recognizes faces and may resize accordingly.
 * Official documentation: https://www.storyblok.com/faq/use-focal-point-set-in-storyblok
 */
export function formatStoryblokUrl(url: string, width: number, height: number, focus?: string | null) {
	let imageSource = url + `/m/${width}x${height}`;
	imageSource += focus ? `/filters:focal(${focus})` : '/smart';
	return imageSource;
}

// ==================== Date Utilities ====================

/**
 * Parse a Storyblok date string into a DateTime object.
 * Storyblok returns date fields in the following format "yyyy-MM-dd HH:mm" without timezone.
 * Nevertheless, the fields `first_published_at` and 'published_at' are returned in proper ISO8601 format.
 */
export function toDateObject(date: string, lang: string) {
	let dateObject = DateTime.fromISO(date).setLocale(lang);
	if (!dateObject.isValid) {
		dateObject = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: 'utc' }).setLocale(lang);
	}
	return dateObject;
}

/**
 * Format a Storyblok date for display.
 */
export function formatStoryblokDate(date: string | null | undefined, lang: string) {
	if (!date) {
		return '';
	}
	let dateObject = toDateObject(date, lang);

	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
}

/**
 * Format a Storyblok date to ISO format.
 */
function formatStoryblokDateToIso(date: string | null | undefined) {
	if (!date) {
		return '';
	}
	let dateObject = toDateObject(date, defaultLanguage);

	return dateObject.isValid ? dateObject.toISO() : '';
}

// ==================== URL Utilities ====================

/**
 * Create a link URL for a journal article.
 */
export function createLinkForArticle(slug: string, lang: string, region: string) {
	return `/${lang}/${region}/journal/${slug}`;
}

// ==================== Metadata Utilities ====================

/**
 * Generate Next.js Metadata for a Storyblok article.
 */
export function generateMetaDataForArticle(storyblokStory: ISbStoryData<ResolvedArticle>, url: string): Metadata {
	const storyblokArticle = storyblokStory.content;
	const title = storyblokArticle.title;
	const description = storyblokArticle.leadText;
	const authorsFullName = `${storyblokArticle.author.content.firstName} ${storyblokArticle.author.content.lastName}`;
	const imageFilename = storyblokArticle.image?.filename;
	const tags = storyblokArticle.tags?.map((it) => it.content.value).join(', ');

	let imageMetaData: { url: string; width?: number; height?: number } | undefined;
	if (imageFilename) {
		const dimensions = getDimensionsFromStoryblokImageUrl(imageFilename);
		if (dimensions.width && dimensions.height) {
			const imageUrl = formatStoryblokUrl(
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
	}

	return {
		title: title,
		description: description,
		keywords: tags,
		authors: { name: authorsFullName },
		openGraph: {
			title: title,
			description: description,
			images: imageMetaData,
			url: url,
			type: 'article',
		},
		twitter: {
			title: title,
			description: description,
			images: imageMetaData,
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
}
