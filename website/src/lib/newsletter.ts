import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export type NewsletterMeta = {
	slug: string;
	title: string;
	date: string;
};

const NEWSLETTER_DIR = path.resolve(process.cwd(), '../shared/emails/newsletter');

/**
 * Get all newsletters, newest first
 */
export function getAllNewsletters(): NewsletterMeta[] {
	const files = fs.readdirSync(NEWSLETTER_DIR).filter((f) => f.endsWith('.html'));

	return files
		.map((filename) => {
			const slug = filename.replace(/\.html$/i, '');
			const filePath = path.join(NEWSLETTER_DIR, filename);
			const content = fs.readFileSync(filePath, 'utf8');

			const $ = cheerio.load(content);
			const rawH1 = $('h1').first().text().trim();

			// Remove "Hi {{...}}" in titles
			const cleanTitle = rawH1
				.replace(/\.\s*Hi\s+{{[^}]+}}\s*\.?$/i, '')
				.replace(/^\s*Hi\s+{{[^}]+}}\s*\.?\s*/i, '')
				.trim();

			// Extract date from slug: YYYY-MM-newsletter
			const [year, month] = slug.split('-');
			const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
			const formattedDate = date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});

			return {
				slug,
				title: cleanTitle || 'Untitled',
				date: formattedDate,
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Render HTML for iframe:
 * - Replace placeholders with defaults
 * - Remove unsubscribe/preferences sections
 * - Secure links
 * - Inject Unica77 font
 */
export function getNewsletterHTML(slug: string): string | null {
	const filePath = path.join(NEWSLETTER_DIR, `${slug}.html`);
	if (!fs.existsSync(filePath)) return null;

	let html = fs.readFileSync(filePath, 'utf8');

	// Replace placeholders
	html = html.replace(
		/{{\s*insert\s+first_name\s+['"“”]default=([^'"“”]+)['"“”]\s*}}/gi,
		(_m, def) => (def ?? 'Friend')
	);
	html = html.replace(/{{\s*firstName\s*}}/gi, 'Friend');

	// Load into Cheerio for DOM manipulations
	const $ = cheerio.load(html);

	// Make links safe + remove unsubscribe/preferences blocks in one pass
	$('a').each((_, a) => {
		const $a = $(a);

		// Always make links safe
		$a.attr('target', '_blank');
		$a.attr('rel', 'noopener noreferrer');

		// Identify unsubscribe/preferences links
		const href = ($a.attr('href') || '').toLowerCase();
		const text = $a.text().trim().toLowerCase();
		const isUnsubLink =
			href.includes('unsubscribe') ||
			href.includes('preferences') ||
			href.includes('update_profile') ||
			href.includes('update-profile') ||
			/unsubscribe|preferences|update profile|manage preferences/i.test(text);

		if (isUnsubLink) {
			const container = $a.closest('p, td, tr, table, div');
			if (container.length) {
				container.remove();
			} else {
				$a.remove();
			}
		}
	});

	// Inject Unica77 font styles
	$('head').prepend(`
  <style>
    @font-face {
      font-family: 'Unica77';
      src: url('/fonts/Unica77LLWeb-Regular.woff2') format('woff2'),
           url('/fonts/Unica77LLWeb-Regular.woff') format('woff');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    body, table, td, th, div, p, span, a {
      font-family: 'Unica77', system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
    }
  </style>
`);

	return $.html();
}