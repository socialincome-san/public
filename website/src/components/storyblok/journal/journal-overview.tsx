import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { JournalArticleList } from '@/components/storyblok/journal/journal-article-list';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { ArticleType, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { createWebsiteJournalArticleTypeLink, getArticleTypeLabel } from '@/lib/storyblok/storyblok-utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import { cn } from '@socialincome/design-system/cn';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	pageTitle: string;
	pageDescription?: string;
	editorsHeading: string;
	allArticleTypesLabel: string;
	initialQuery: string;
	moreArticlesLabel: string;
	videoLabel: string;
	pathname: string;
	journalPath: string;
	activeTagSlug?: string;
	activeArticleTypeSlug?: string;
	lang: string;
	currency: WebsiteCurrency;
	articles: ISbStoryData<JournalArticle>[];
	authors: ISbStoryData<Person>[];
	articleTypes: ISbStoryData<ArticleType>[];
	showMoreArticlesLink: boolean;
	roleLabels: Record<string, string>;
};

// Looks like the FilterTrigger pills of the other overviews: the active one is filled, not outlined
const articleTypeFilterClassName = (active: boolean) =>
	cn(
		'border-border text-foreground focus-visible:ring-ring inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden',
		active ? 'bg-input' : 'bg-card hover:bg-muted',
	);

export const JournalOverview = ({
	breadcrumbs,
	pageTitle,
	pageDescription,
	editorsHeading,
	allArticleTypesLabel,
	initialQuery,
	moreArticlesLabel,
	videoLabel,
	pathname,
	journalPath,
	activeTagSlug,
	activeArticleTypeSlug,
	lang,
	currency,
	articles,
	authors,
	articleTypes,
	showMoreArticlesLink,
	roleLabels,
}: Props) => (
	<JournalPageShell>
		<JournalBreadcrumb links={breadcrumbs} />
		<PageIntro title={pageTitle} description={pageDescription} />

		<JournalArticleList
			filters={
				<>
					<Link href={journalPath} className={articleTypeFilterClassName(!activeTagSlug && !activeArticleTypeSlug)}>
						{allArticleTypesLabel}
					</Link>
					{articleTypes.map((articleType) => (
						<Link
							key={articleType.slug}
							href={createWebsiteJournalArticleTypeLink(articleType.slug, lang, currency)}
							className={articleTypeFilterClassName(activeArticleTypeSlug === articleType.slug)}
						>
							{getArticleTypeLabel(articleType)}
						</Link>
					))}
				</>
			}
			articles={articles}
			initialQuery={initialQuery}
			lang={lang}
			currency={currency}
			videoLabel={videoLabel}
		/>

		{showMoreArticlesLink && <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} />}

		{showMoreArticlesLink && authors.length > 0 && <Separator />}

		{authors.length > 0 && (
			<section>
				<PersonCarousel
					persons={authors}
					sidebar={{ heading: editorsHeading }}
					personLink={{ lang, currency }}
					size="small"
					roleLabels={roleLabels}
				/>
			</section>
		)}
	</JournalPageShell>
);
