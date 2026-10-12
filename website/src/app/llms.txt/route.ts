import { defaultCurrency, defaultLanguage, getWebsiteBasePath } from '@/lib/i18n/utils';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';

const pageUrl = (pathTail = '') =>
	`${WEBSITE_ORIGIN}${getWebsiteBasePath(defaultLanguage, defaultCurrency)}${pathTail ? `/${pathTail}` : ''}`;

const llmsTxt = `# Social Income

> Social Income is a nonprofit that provides unconditional cash transfers to people living in poverty.

Public pages are available in English, German, French, and Italian, under \`/{lang}/{currency}/\` URLs. The currency (\`chf\`, \`eur\` or \`usd\`) only changes how amounts are shown; the \`usd\` pages are canonical.

## Core pages

- [Home](${pageUrl()}): Mission, impact, and how Social Income works
- [Programs](${pageUrl('programs')}): Active cash transfer programs
- [Journal](${pageUrl('journal')}): Articles, research, and project updates
- [Campaigns](${pageUrl('campaigns')}): Public fundraising campaigns
- [Countries](${pageUrl('countries')}): Countries where we operate
- [Local partners](${pageUrl('local-partners')}): Partner organizations in the field
- [Focus areas](${pageUrl('focuses')}): Thematic areas of our work

Portal, contributor dashboard, and partner space require login and are not public website content.

## Optional

- [Sitemap](${WEBSITE_ORIGIN}/sitemap.xml): Machine-readable list of public URLs
- [Robots](${WEBSITE_ORIGIN}/robots.txt): Crawler rules for this site section
`;

export const GET = () =>
	new Response(llmsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
