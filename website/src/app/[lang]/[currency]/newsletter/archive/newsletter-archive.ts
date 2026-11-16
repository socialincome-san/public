import DOMPurify from 'isomorphic-dompurify';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const newsletterDirectory = path.join(process.cwd(), 'emails', 'newsletter');
const newsletterFilenamePattern = /^(\d{4})-(0[1-9]|1[0-2])-newsletter\.html$/;
const newsletterIdPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export type NewsletterArchiveEntry = {
	id: string;
	title: string;
	html: string;
};

const extractNewsletterTitle = (html: string, filename: string) => {
	const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
	if (!heading) {
		throw new Error(`Newsletter ${filename} is missing its h1 title.`);
	}

	const titleFragment = DOMPurify.sanitize(heading[1], { ALLOWED_TAGS: [], RETURN_DOM_FRAGMENT: true });
	const title = titleFragment.textContent?.replace(/\s+Hi\s+\{\{\s*insert\s+first_name\b[^}]*\}\}\.?\s*$/i, '').trim();
	if (!title) {
		throw new Error(`Newsletter ${filename} has an empty h1 title.`);
	}

	return title;
};

const parseNewsletterFilename = (filename: string) => {
	const match = filename.match(newsletterFilenamePattern);

	return match ? { id: `${match[1]}-${match[2]}`, filename } : null;
};

export const getNewsletterArchiveEntries = async (): Promise<NewsletterArchiveEntry[]> => {
	const files = (await readdir(newsletterDirectory))
		.map(parseNewsletterFilename)
		.filter((file) => file !== null)
		.sort((left, right) => right.id.localeCompare(left.id));

	return Promise.all(
		files.map(async ({ id, filename }) => {
			const html = await readFile(path.join(newsletterDirectory, filename), 'utf8');

			return { id, title: extractNewsletterTitle(html, filename), html };
		}),
	);
};

export const getNewsletterArchiveEntry = async (id: string): Promise<NewsletterArchiveEntry | null> => {
	if (!newsletterIdPattern.test(id)) {
		return null;
	}

	const filename = `${id}-newsletter.html`;
	if (!(await readdir(newsletterDirectory)).includes(filename)) {
		return null;
	}

	const html = await readFile(path.join(newsletterDirectory, filename), 'utf8');

	return { id, title: extractNewsletterTitle(html, filename), html };
};

export const prepareNewsletterHtml = (html: string) =>
	html
		.replace(/\{\{\s*insert\s+first_name\s*'default=([^']*)'\s*\}\}/gi, (_placeholder, fallback: string) => fallback)
		.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (anchor, attributes: string, content: string) =>
			/\bhref\s*=\s*(["'])\{\{\{\s*unsubscribe(?:_preferences)?\s*\}\}\}\1/i.test(attributes) ? content : anchor,
		)
		// Links would otherwise load inside the frame, where most sites refuse to be shown.
		.replace(/<head\b[^>]*>/i, '$&<base target="_blank">');

export const formatNewsletterDate = (id: string, locale: string) => {
	const match = id.match(newsletterIdPattern);
	if (!match) {
		throw new Error(`Invalid newsletter ID: ${id}`);
	}

	return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
		new Date(`${match[0]}-01T00:00:00Z`),
	);
};
