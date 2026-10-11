import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonProfileHeader } from '@/components/storyblok/journal/person-profile-header';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { formatStoryblokUrl, getPersonDisplayName } from '@/lib/storyblok/storyblok-utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';

const PERSON_PORTRAIT_WIDTH = 384;
const PERSON_PORTRAIT_HEIGHT = 480;

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	person: ISbStoryData<Person>;
	articles: ISbStoryData<JournalArticle>[];
	articlesHeading: string;
	lang: string;
	currency: WebsiteCurrency;
	pathname: string;
	moreArticlesLabel: string;
	videoLabel: string;
	showMoreArticlesLink: boolean;
	roleLabels: Record<string, string>;
};

export const PersonProfile = ({
	breadcrumbs,
	person,
	articles,
	articlesHeading,
	lang,
	currency,
	pathname,
	moreArticlesLabel,
	videoLabel,
	showMoreArticlesLink,
	roleLabels,
}: Props) => {
	const avatar = person.content.avatar;
	const portraitSrc = avatar?.filename
		? formatStoryblokUrl(avatar.filename, PERSON_PORTRAIT_WIDTH, PERSON_PORTRAIT_HEIGHT, avatar.focus)
		: null;

	return (
		<JournalPageShell>
			<JournalBreadcrumb links={breadcrumbs} />
			<PersonProfileHeader
				person={person}
				name={getPersonDisplayName(person)}
				portraitSrc={portraitSrc}
				roleLabels={roleLabels}
			/>

			{articles.length > 0 && (
				<section className="space-y-8">
					<Separator />
					<SectionHeading align="left" size={4} bold>
						{articlesHeading}
					</SectionHeading>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{articles.map((article) => (
							<JournalArticleCard
								key={article.uuid}
								lang={lang}
								currency={currency}
								article={article}
								videoLabel={videoLabel}
							/>
						))}
					</div>
				</section>
			)}

			{showMoreArticlesLink && <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} />}
		</JournalPageShell>
	);
};
