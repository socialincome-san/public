import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { SectionHeading } from '@/components/section-heading';
import { Separator } from '@/components/separator';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonProfileHeader } from '@/components/storyblok/journal/person-profile-header';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { getPersonPortraitSrc } from '@/lib/services/journal/journal.utils';
import { getPersonDisplayName, ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	person: ISbStoryData<Person>;
	articles: ISbStoryData<ResolvedArticle>[];
	articlesHeading: string;
	lang: string;
	region: string;
	pathname: string;
	moreArticlesLabel: string;
	showMoreArticlesLink: boolean;
};

export const PersonProfile = ({
	breadcrumbs,
	person,
	articles,
	articlesHeading,
	lang,
	region,
	pathname,
	moreArticlesLabel,
	showMoreArticlesLink,
}: Props) => (
	<JournalPageShell>
		<JournalBreadcrumb links={breadcrumbs} />
		<PersonProfileHeader person={person} name={getPersonDisplayName(person)} portraitSrc={getPersonPortraitSrc(person)} />

		{articles.length > 0 && (
			<section className="space-y-8">
				<Separator />
				<SectionHeading align="left" size="medium" className="mb-0 text-cyan-900 md:mb-0">
					{articlesHeading}
				</SectionHeading>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<JournalArticleCard key={article.uuid} lang={lang} region={region} article={article} />
					))}
				</div>
			</section>
		)}

		{showMoreArticlesLink && <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} />}
	</JournalPageShell>
);
