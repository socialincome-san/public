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
	const title = titleFragment.textContent?.trim();
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

export const prepareNewsletterHtml = (html: string) => {
	const withFallbackNames = html
		.replace(
			/\{\{\s*insert\s+first_name\s*'default=([^']*)'\s*\}\}/gi,
			(_placeholder, fallback: string) => fallback.trim() || 'there',
		)
		.replace(/\{\{\s*first_name\s*\}\}/gi, 'there')
		.replace(/\{\{\s*firstName\s*\}\}/gi, 'there');

	const withoutUnsubscribeLinks = withFallbackNames.replace(
		/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi,
		(anchor, attributes: string, content: string) => {
			const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
			if (href && /^\{\{\{\s*unsubscribe(?:_preferences)?\s*\}\}\}$/i.test(href.trim())) {
				return content;
			}

			return anchor;
		},
	);

	return withoutUnsubscribeLinks.replace(/<a\b[^>]*>/gi, (anchor) => {
		if (!/\bhref\s*=\s*(["'])https?:\/\/[^"']*\1/i.test(anchor)) {
			return anchor;
		}

		const withBlankTarget = /\btarget\s*=/i.test(anchor)
			? anchor.replace(/\btarget\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, 'target="_blank"')
			: anchor.replace(/>$/, ' target="_blank">');

		return /\brel\s*=/i.test(withBlankTarget)
			? withBlankTarget.replace(/\brel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, 'rel="noopener noreferrer"')
			: withBlankTarget.replace(/>$/, ' rel="noopener noreferrer">');
	});
};

export const formatNewsletterDate = (id: string, locale: string) => {
	const match = id.match(newsletterIdPattern);
	if (!match) {
		throw new Error(`Invalid newsletter ID: ${id}`);
	}

	return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
		new Date(`${match[0]}-01T00:00:00Z`),
	);
};
