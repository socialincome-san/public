import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { Separator } from '@/components/separator';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageHeader } from '@/components/storyblok/journal/journal-page-header';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { Person, Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import { createNewWebsiteJournalTagLink, ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	pageTitle: string;
	pageDescription?: string;
	editorsHeading: string;
	allTagsLabel: string;
	moreArticlesLabel: string;
	pathname: string;
	journalPath: string;
	activeTagSlug?: string;
	lang: string;
	region: string;
	articles: ISbStoryData<ResolvedArticle>[];
	authors: ISbStoryData<Person>[];
	tags: ISbStoryData<Tag>[];
	showMoreArticlesLink: boolean;
};

const tagFilterClassName = (active: boolean) =>
	cn(
		'inline-flex rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
		active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80',
	);

export const JournalOverview = ({
	breadcrumbs,
	pageTitle,
	pageDescription,
	editorsHeading,
	allTagsLabel,
	moreArticlesLabel,
	pathname,
	journalPath,
	activeTagSlug,
	lang,
	region,
	articles,
	authors,
	tags,
	showMoreArticlesLink,
}: Props) => (
	<JournalPageShell>
		<JournalBreadcrumb links={breadcrumbs} />
		<JournalPageHeader title={pageTitle} description={pageDescription} />

		<section className="flex flex-wrap gap-2">
			<Link href={journalPath} className={tagFilterClassName(!activeTagSlug)}>
				{allTagsLabel}
			</Link>
			{tags.map((tag) => (
				<Link
					key={tag.slug}
					href={createNewWebsiteJournalTagLink(tag.slug, lang, region)}
					className={tagFilterClassName(activeTagSlug === tag.slug)}
				>
					{tag.content?.value}
				</Link>
			))}
		</section>

		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{articles.map((article) => (
				<JournalArticleCard key={article.uuid} lang={lang} region={region} article={article} />
			))}
		</div>

		{showMoreArticlesLink ? <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} /> : null}

		{showMoreArticlesLink && authors.length > 0 ? <Separator /> : null}

		{authors.length > 0 ? (
			<section>
				<PersonCarousel persons={authors} sidebar={{ heading: editorsHeading }} personLink={{ lang, region }} />
			</section>
		) : null}
	</JournalPageShell>
);
