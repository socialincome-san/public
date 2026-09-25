import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { SectionHeading } from '@/components/section-heading';
import { Separator } from '@/components/separator';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonProfileHeader, type PersonProfileTranslations } from '@/components/storyblok/journal/person-profile-header';
import type { VolunteerDurationConfig } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getPersonPortraitSrc } from '@/lib/services/journal/journal.utils';
import { getPersonDisplayName, ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	person: ISbStoryData<Person>;
	articles: ISbStoryData<ResolvedArticle>[];
	articlesHeading: string;
	profileTranslations: PersonProfileTranslations;
	lang: string;
	region: string;
	pathname: string;
	moreArticlesLabel: string;
	videoLabel: string;
	showMoreArticlesLink: boolean;
	roleLabels: Record<string, string>;
	circleLabels: Record<string, string>;
	volunteerDuration?: VolunteerDurationConfig;
};

// The duration labels are "{{count}}" templates shared with the person cards, so they are collected
// here rather than at each person page.
export const buildVolunteerDurationConfig = (translator: Translator, lang: WebsiteLanguage): VolunteerDurationConfig => ({
	lang,
	translations: {
		startedToday: translator.t('person-grid.duration-started-today'),
		daySingular: translator.t('person-grid.duration-day-singular'),
		dayPlural: translator.t('person-grid.duration-day-plural'),
		monthSingular: translator.t('person-grid.duration-month-singular'),
		monthPlural: translator.t('person-grid.duration-month-plural'),
		yearSingular: translator.t('person-grid.duration-year-singular'),
		yearPlural: translator.t('person-grid.duration-year-plural'),
		monthAnniversarySingular: translator.t('person-grid.duration-month-anniversary-singular'),
		monthAnniversaryPlural: translator.t('person-grid.duration-month-anniversary-plural'),
		yearAnniversarySingular: translator.t('person-grid.duration-year-anniversary-singular'),
		yearAnniversaryPlural: translator.t('person-grid.duration-year-anniversary-plural'),
		since: translator.t('person-grid.duration-since'),
	},
});

export const PersonProfile = ({
	breadcrumbs,
	person,
	articles,
	articlesHeading,
	profileTranslations,
	lang,
	region,
	pathname,
	moreArticlesLabel,
	videoLabel,
	showMoreArticlesLink,
	roleLabels,
	circleLabels,
	volunteerDuration,
}: Props) => (
	<JournalPageShell className="px-6 sm:px-6">
		<JournalBreadcrumb links={breadcrumbs} className="mb-12 w-full px-0" />
		<PersonProfileHeader
			person={person}
			name={getPersonDisplayName(person)}
			portraitSrc={getPersonPortraitSrc(person)}
			roleLabels={roleLabels}
			circleLabels={circleLabels}
			translations={profileTranslations}
			volunteerDuration={volunteerDuration}
		/>

		{articles.length > 0 && (
			<section className="space-y-8">
				<Separator />
				<SectionHeading align="left" size={4} bold className="text-foreground mb-4 md:mb-6">
					{articlesHeading}
				</SectionHeading>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<JournalArticleCard key={article.uuid} lang={lang} region={region} article={article} videoLabel={videoLabel} />
					))}
				</div>
			</section>
		)}

		{showMoreArticlesLink && <MoreArticlesButton label={moreArticlesLabel} pathname={pathname} />}
	</JournalPageShell>
);
