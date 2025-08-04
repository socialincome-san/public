import fs from 'fs';
import path from 'path';

const NEWSLETTER_DIR = path.resolve(process.cwd(), '../shared/emails/newsletter');

export type NewsletterMeta = {
	slug: string;
	title: string;
	date: string;
};

export function getAllNewsletters(): NewsletterMeta[] {
	const files = fs.readdirSync(NEWSLETTER_DIR).filter((file) => file.endsWith('.html'));

	return files
		.map((filename) => {
			const slug = filename.replace('.html', '');
			const filePath = path.join(NEWSLETTER_DIR, filename);
			const content = fs.readFileSync(filePath, 'utf8');

			// Extract first <h1>
			const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
			let title = h1Match?.[1]?.trim() || `Newsletter ${slug}`;

			// Remove personalization placeholder
			title = title.replace(/\.?\s*Hi\s+{{[^}]+}}/, '').trim();

			// Remove trailing span like: <span style="...">.</span>
			title = title.replace(/<span[^>]*>\.*<\/span>$/i, '').trim();

			// Remove trailing period, if any
			title = title.replace(/\.*\s*$/, '');

			// Remove personalization placeholder from title
			title = title.replace(/\.?\s*Hi\s+{{[^}]+}}/, '').trim() || 'Untitled';

			// Format date from slug
			const [year, month] = slug.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1, 1);
			const formattedDate = date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});

			return { slug, title, date: formattedDate };
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getNewsletterHTML(slug: string): string | null {
	const filePath = path.join(NEWSLETTER_DIR, `${slug}.html`);
	if (!fs.existsSync(filePath)) return null;

	let html = fs.readFileSync(filePath, 'utf8');

	// Handle {{ insert first_name 'default=there' }}
	html = html.replace(
		/{{\s*insert\s+first_name\s+['"]default=(.*?)['"]\s*}}/gi,
		(_, defaultValue) => defaultValue || 'Friend'
	);

	// Secure links
	html = html.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');

	// Inject font styling
	const injectedStyles = `
		<style>h1Match
			@font-face {
				font-family: 'Unica77';
				src: url('/fonts/Unica77LLWeb-Regular.woff2') format('woff2'),
					 url('/fonts/Unica77LLWeb-Regular.woff') format('woff');
				font-weight: normal;
				font-style: normal;
				font-display: swap;
			}
			body {
				font-family: 'Unica77', sans-serif;
			}
		</style>
	`;

	html = html.replace(/<head>/i, `<head>${injectedStyles}`);

	return html;
}