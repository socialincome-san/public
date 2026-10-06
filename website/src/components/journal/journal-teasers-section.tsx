import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import { Button } from '@socialincome/design-system/button/button';
import { cn } from '@socialincome/design-system/cn';
import { SectionHeading } from '@socialincome/design-system/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
	articles: ISbStoryData<JournalArticle>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	heading?: ReactNode;
	journalCtaLabel: string;
	videoLabel: string;
};

export const JournalTeasersSection = ({ articles, lang, region, heading, journalCtaLabel, videoLabel }: Props) => {
	const [featuredArticle, ...secondaryArticles] = articles;
	const hasSecondaryArticles = secondaryArticles.length > 0;

	return (
		<div>
			<div className="mb-8 flex flex-col justify-between gap-4 md:mb-10 md:flex-row md:items-center">
				{heading && <SectionHeading align="left">{heading}</SectionHeading>}
				<div>
					<Button variant="outline" asChild>
						<Link href={`/${lang}/${region}/journal`}>{journalCtaLabel}</Link>
					</Button>
				</div>
			</div>

			<div className={cn('grid grid-cols-1 gap-4 lg:gap-8', hasSecondaryArticles && 'lg:grid-cols-2')}>
				<JournalArticleCard
					article={featuredArticle}
					lang={lang}
					region={region}
					variant="featured"
					videoLabel={videoLabel}
				/>
				{hasSecondaryArticles && (
					<div className={cn('grid h-full grid-cols-1 gap-4 lg:gap-8', secondaryArticles.length > 1 && 'lg:grid-rows-2')}>
						{secondaryArticles.map((article) => (
							<JournalArticleCard
								key={article.uuid}
								article={article}
								lang={lang}
								region={region}
								variant="secondary"
								videoLabel={videoLabel}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
