// Based on official documentation: https://www.storyblok.com/faq/image-dimensions-assets-js
// format example: a.storyblok.com/f/51376/664x488/f4f9d1769c/visual-editor-features.jpg
import { DateTime } from 'luxon';

export function formatStoryblokUrl(url: string, width: number, height: number, focus?: string) {
	let imageSource = url + `/m/${width}x${height}`;
	imageSource += focus ? `/filters:focal(${focus})` : '/smart';
	return imageSource;
}

// Storyblok returns date fields in the following format  "yyyy-MM-dd HH:mm" without timezone
// But the fields `first_published_at`, 'published_at' are returned in proper ISO8601 format
export function formatStoryblokDate(date: string | null | undefined, lang: string) {
	if (!date) {
		return '';
	}
	let dateObject = DateTime.fromISO(date).setLocale(lang);

	if (!dateObject.isValid) {
		dateObject = DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: 'utc' }).setLocale(lang);
	}

	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
}

export function createLinkForArticle(slug: string, lang: string, region: string) {
	return `/${lang}/${region}/journal/${slug}`;
}
