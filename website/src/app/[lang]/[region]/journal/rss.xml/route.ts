import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { buildJournalRssFeed } from '@/lib/storyblok/journal-rss';
import { getPublishedJournalArticles } from '@/modules/journal/journal.service';

export const revalidate = 900;

type JournalRssRouteContext = {
	params: Promise<{ lang: WebsiteLanguage; region: WebsiteRegion }>;
};

export const GET = async (_request: Request, context: JournalRssRouteContext) => {
	const { lang } = await context.params;
	const result = await getPublishedJournalArticles(lang);

	if (!result.success) {
		return new Response('Unable to load the journal feed.', { status: 503 });
	}

	return new Response(buildJournalRssFeed(result.data, `https://socialincome.org/${lang}`, lang), {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	});
};
