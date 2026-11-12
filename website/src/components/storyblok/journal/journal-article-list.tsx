'use client';

import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { getArticleSearchText, matchesArticleSearch } from '@/components/storyblok/journal/article-search';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { SearchInput } from '@socialincome/design-system/forms/search-input/search-input';
import type { ISbStoryData } from '@storyblok/js';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

const SEARCH_PARAM = 'q';

type Props = {
	// The article type links, shown in the same row as the count and the search
	filters: ReactNode;
	articles: ISbStoryData<JournalArticle>[];
	initialQuery: string;
	lang: string;
	currency: WebsiteCurrency;
	videoLabel: string;
};

export const JournalArticleList = ({ filters, articles, initialQuery, lang, currency, videoLabel }: Props) => {
	const t = useTranslations('website-journal');
	const isMobile = useIsMobile();
	const [query, setQuery] = useState(initialQuery);
	const visibleArticles = articles.filter((article) => matchesArticleSearch(getArticleSearchText(article), query));
	const isSearching = query.trim() !== '';

	const search = (value: string) => {
		setQuery(value);
		// Keeps the search linkable without asking the server for the page again
		const searchParams = new URLSearchParams(window.location.search);
		if (value.trim()) {
			searchParams.set(SEARCH_PARAM, value);
		} else {
			searchParams.delete(SEARCH_PARAM);
		}
		const queryString = searchParams.toString();
		window.history.replaceState(null, '', queryString ? `?${queryString}` : window.location.pathname);
	};

	return (
		<>
			<section className="flex flex-wrap items-center gap-x-2 gap-y-4">
				{/* On mobile the filters stay on one line and scroll sideways; the fade on the right hints at more, and the
				    padding lets the last filter scroll clear of it */}
				<div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto pr-10 max-md:[scrollbar-width:none] max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] md:w-auto md:flex-1 md:flex-wrap md:overflow-visible md:pr-0">
					{filters}
				</div>
				{/* On mobile the search placeholder carries the count instead */}
				<span
					aria-live="polite"
					className="text-muted-foreground ml-auto hidden text-sm font-normal whitespace-nowrap md:inline"
				>
					{isSearching
						? t('overview.article-count-filtered', { count: visibleArticles.length, total: articles.length })
						: t('overview.article-count', { count: articles.length })}
				</span>
				<div className="w-full md:ml-2 md:w-56">
					<SearchInput
						aria-label={t('overview.search')}
						placeholder={isMobile ? t('overview.search-count', { count: articles.length }) : t('overview.search')}
						value={query}
						onChange={(event) => search(event.target.value)}
					/>
				</div>
			</section>

			{visibleArticles.length === 0 && isSearching ? (
				<div className="flex flex-col items-center gap-3 py-10">
					<p className="text-muted-foreground text-sm">{t('overview.no-results', { query: query.trim() })}</p>
					<Button variant="outline" size="sm" onClick={() => search('')}>
						{t('overview.clear-search')}
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{visibleArticles.map((article, index) => (
						<JournalArticleCard
							key={article.uuid}
							lang={lang}
							currency={currency}
							article={article}
							videoLabel={videoLabel}
							preload={index === 0}
						/>
					))}
				</div>
			)}
		</>
	);
};
