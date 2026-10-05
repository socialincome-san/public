import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import { buildJournalRssFeed } from '@/lib/services/journal/journal-rss';
import { services } from '@/lib/services/services';

export const revalidate = 900;

export const GET = async () => {
	const result = await services.storyblok.getPublishedJournalArticles(defaultLanguage);

	if (!result.success) {
		return new Response('Unable to load the journal feed.', { status: 503 });
	}

	return new Response(buildJournalRssFeed(result.data, `https://socialincome.org/${defaultLanguage}/${defaultRegion}`), {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
	});
};
