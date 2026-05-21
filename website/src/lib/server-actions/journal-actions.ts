'use server';

import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

export const getLatestJournalArticlesAction = async (lang: WebsiteLanguage) => {
	const result = await services.storyblok.getLatestJournalArticles(lang);

	return result.success ? result.data : [];
};
