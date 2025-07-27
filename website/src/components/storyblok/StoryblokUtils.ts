import { defaultLanguage } from '@/lib/i18n/utils';
import { DateTime } from 'luxon';

// Storyblok provides out of the box image resizing/cropping, which can be combined with a custom focal point.
// If that's not defined, we are using the smart feature, which recognizes faces and may resize accordingly.
// Official documentation: https://www.storyblok.com/faq/use-focal-point-set-in-storyblok
export function formatStoryblokUrl(url: string, width: number, height: number, focus?: string) {
	let imageSource = url + `/m/${width}x${height}`;
	imageSource += focus ? `/filters:focal(${focus})` : '/smart';
	return imageSource;
}

// Storyblok returns date fields in the following format "yyyy-MM-dd HH:mm" without timezone.
// Nevertheless, the fields `first_published_at` and 'published_at' are returned in proper ISO8601 format.
export function formatStoryblokDate(date: string | null | undefined, lang: string) {
	if (!date) {
		return '';
	}
	let dateObject = toDateObject(date, lang);

	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
}

function toDateObject(date: string, lang: string) {
	let dateObject = DateTime.fromISO(date).setLocale(lang);
	if (!dateObject.isValid) {
		dateObject = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: 'utc' }).setLocale(lang);
	}
	return dateObject;
}

export function formatStoryblokDateToIso(date: string | null | undefined) {
	if (!date) {
		return '';
	}
	let dateObject = toDateObject(date, defaultLanguage);

	return dateObject.isValid ? dateObject.toISO({ includeOffset: false }) : '';
}

export function createLinkForArticle(slug: string, lang: string, region: string) {
	return `/${lang}/${region}/journal/${slug}`;
}

// Based on official documentation: https://www.storyblok.com/faq/image-dimensions-assets-js
// format example: https://a.storyblok.com/f/51376/664x488/f4f9d1769c/visual-editor-features.jpg
export function getDimensionsFromStoryblokImageUrl(url: string): { width?: number; height?: number } {
	if (!url) {
		return {};
	}
	const match = url.match(/\/f\/\d+\/(\d+)x(\d+)\//);

	return match ? { width: Number(match[1]), height: Number(match[2]) } : {};
}
