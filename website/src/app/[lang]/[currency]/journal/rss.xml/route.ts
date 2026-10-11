import { allWebsiteLanguages } from '@/lib/i18n/utils';
import { buildJournalRssFeed } from '@/lib/storyblok/journal-rss';
import { getPublishedJournalArticles } from '@/modules/journal/journal.cache';

type JournalRssRouteContext = {
	params: Promise<{ lang: string; currency: string }>;
};

export const GET = async (_request: Request, context: JournalRssRouteContext) => {
	const { lang: requestedLanguage } = await context.params;
	const lang = allWebsiteLanguages.find((language) => language === requestedLanguage);
	if (!lang) {
		return new Response('Journal feed language not found.', { status: 404 });
	}

	const result = await getPublishedJournalArticles(lang);

	if (!result.success) {
		return new Response('Unable to load the journal feed.', { status: 503 });
	}

	return new Response(buildJournalRssFeed(result.data, `https://socialincome.org/${lang}`, lang), {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	});
};
