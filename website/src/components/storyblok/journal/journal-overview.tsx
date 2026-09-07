import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { Separator } from '@/components/separator';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageHeader } from '@/components/storyblok/journal/journal-page-header';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { ArticleType, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	createWebsiteJournalArticleTypeLink,
	getArticleTypeLabel,
	ResolvedArticle,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	pageTitle: string;
	pageDescription?: string;
	editorsHeading: string;
	allArticleTypesLabel: string;
	moreArticlesLabel: string;
	videoLabel: string;
	pathname: string;
	journalPath: string;
	activeTagSlug?: string;
	activeArticleTypeSlug?: string;
	lang: string;
	region: string;
	articles: ISbStoryData<ResolvedArticle>[];
	authors: ISbStoryData<Person>[];
	articleTypes: ISbStoryData<ArticleType>[];
	showMoreArticlesLink: boolean;
	roleLabels: Record<string, string>;
};

const articleTypeFilterClassName = (active: boolean) =>
	cn(
		'inline-flex rounded-full border bg-transparent px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
		active
			? 'border-foreground text-foreground'
			: 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50',
	);

export const JournalOverview = ({
	breadcrumbs,
	pageTitle,
	pageDescription,
	editorsHeading,
	allArticleTypesLabel,
	moreArticlesLabel,
	videoLabel,
	pathname,
	journalPath,
	activeTagSlug,
	activeArticleTypeSlug,
	lang,
	region,
	articles,
	authors,
	articleTypes,
	showMoreArticlesLink,
	roleLabels,
}: Props) => (
	<JournalPageShell>
		<JournalBreadcrumb links={breadcrumbs} className="mb-8 pl-0" />
		<JournalPageHeader title={pageTitle} description={pageDescription} />

		<section className="flex flex-wrap gap-2">
			<Link href={journalPath} className={articleTypeFilterClassName(!activeTagSlug && !activeArticleTypeSlug)}>
				{allArticleTypesLabel}
			</Link>
			{articleTypes.map((articleType) => (
				<Link
					key={articleType.slug}
					href={createWebsiteJournalArticleTypeLink(articleType.slug, lang, region)}
					className={articleTypeFilterClassName(activeArticleTypeSlug === articleType.slug)}
				>
					{getArticleTypeLabel(articleType)}
				</Link>
			))}
		</section>

		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{articles.map((article) => (
				<JournalArticleCard key={article.uuid} lang={lang} region={region} article={article} videoLabel={videoLabel} />
			))}
		</div>

		{showMoreArticlesLink && <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} />}

		{showMoreArticlesLink && authors.length > 0 && <Separator />}

		{authors.length > 0 && (
			<section>
				<PersonCarousel
					persons={authors}
					sidebar={{ heading: editorsHeading }}
					personLink={{ lang, region }}
					size="small"
					roleLabels={roleLabels}
				/>
			</section>
		)}
	</JournalPageShell>
);
