import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { SectionHeading } from '@/components/section-heading';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
	articles: ISbStoryData<ResolvedArticle>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	heading?: ReactNode;
	journalCtaLabel: string;
	blok?: SbBlokData;
};

export const JournalTeasersSection = ({ articles, lang, region, heading, journalCtaLabel, blok }: Props) => {
	const [featuredArticle, ...secondaryArticles] = articles;
	const hasSecondaryArticles = secondaryArticles.length > 0;

	return (
		<BlockWrapper {...(blok ? storyblokEditable(blok) : {})}>
			<div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
				{heading && (
					<SectionHeading align="left" className="mb-0 md:mb-0">
						{heading}
					</SectionHeading>
				)}
				<div>
					<Button variant="outline" asChild>
						<Link href={`/${lang}/${region}/journal`}>{journalCtaLabel}</Link>
					</Button>
				</div>
			</div>

			<div className={cn('grid grid-cols-1 gap-4 lg:gap-8', hasSecondaryArticles && 'lg:grid-cols-2')}>
				<JournalArticleCard article={featuredArticle} lang={lang} region={region} variant="featured" />
				{hasSecondaryArticles && (
					<div className={cn('grid h-full grid-cols-1 gap-4 lg:gap-8', secondaryArticles.length > 1 && 'lg:grid-rows-2')}>
						{secondaryArticles.map((article) => (
							<JournalArticleCard key={article.uuid} article={article} lang={lang} region={region} variant="secondary" />
						))}
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};
