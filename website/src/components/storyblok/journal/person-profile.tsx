import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonBio } from '@/components/storyblok/journal/person-bio';
import { PersonHero } from '@/components/storyblok/journal/person-hero';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { getBioSegments } from '@/lib/storyblok/person-bio';
import { getPersonFirstName } from '@/lib/storyblok/storyblok-utils';
import type { JournalPersonPageData } from '@/modules/journal/journal.types';
import { ShowMoreToggle } from '@socialincome/design-system/actions/show-more-toggle/show-more-toggle';
import { LinkList } from '@socialincome/design-system/data-display/link-list/link-list';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { AsideSection } from '@socialincome/design-system/layout/aside-section/aside-section';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

const ARTICLES_PREVIEW_COUNT = 3;

type Props = Pick<
	JournalPersonPageData,
	| 'person'
	| 'articles'
	| 'contributions'
	| 'otherPersons'
	| 'neighbors'
	| 'activePeopleCount'
	| 'pathname'
	| 'showMoreArticlesLink'
	| 'roleLabels'
	| 'circleLabels'
	| 'workStyleLabels'
> & {
	lang: string;
	currency: WebsiteCurrency;
	todayMs: number;
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="space-y-8">
		<SectionHeading align="left" size={4} bold>
			{title}
		</SectionHeading>
		{children}
	</section>
);

export const PersonProfile = ({
	person,
	articles,
	contributions,
	otherPersons,
	neighbors,
	activePeopleCount,
	lang,
	currency,
	pathname,
	showMoreArticlesLink,
	roleLabels,
	circleLabels,
	workStyleLabels,
	todayMs,
}: Props) => {
	const t = useTranslations('website-journal');
	const shortName = getPersonFirstName(person);
	// A line separates each section from the one before it, so the first section on the page has none
	const hasBio = getBioSegments(person.content.bio).length > 0;
	const hasContributions = contributions.length > 0;
	const hasArticles = articles.length > 0;

	return (
		<>
			<PersonHero
				person={person}
				neighbors={neighbors}
				activePeopleCount={activePeopleCount}
				roleLabels={roleLabels}
				circleLabels={circleLabels}
				workStyleLabels={workStyleLabels}
				lang={lang}
				currency={currency}
				todayMs={todayMs}
			/>
			<JournalPageShell>
				<PersonBio label={t('person.about', { name: shortName })} bio={person.content.bio} />

				{hasContributions && (
					<>
						{hasBio && <Separator />}
						<AsideSection
							title={t('person.contributions-title')}
							description={t('person.contributions-description', { name: shortName, count: contributions.length })}
						>
							<LinkList
								items={contributions.map((contribution) => ({
									label: contribution.title,
									href: contribution.href,
									tags: contribution.roles,
								}))}
								// The list fills in the count of the current filter
								showMoreLabel={t('person.contributions-show-all', { count: '{count}' })}
								showLessLabel={t('person.contributions-show-fewer')}
								tagFilter={{
									allLabel: t('person.contributions-all'),
									ariaLabel: t('person.contributions-filter'),
								}}
							/>
						</AsideSection>
					</>
				)}

				{hasArticles && (
					<>
						{(hasBio || hasContributions) && <Separator />}
						<Section title={t('person.articles', { name: shortName })}>
							<ShowMoreToggle
								layout="grid"
								initialCount={ARTICLES_PREVIEW_COUNT}
								showMoreLabel={t('person.articles-show-all', { count: articles.length })}
								showLessLabel={t('person.articles-show-fewer')}
							>
								{articles.map((article) => (
									<JournalArticleCard
										key={article.uuid}
										lang={lang}
										currency={currency}
										article={article}
										videoLabel={t('badge.video')}
									/>
								))}
							</ShowMoreToggle>
							{showMoreArticlesLink && <MoreArticlesButton label={t('overview.more-articles')} pathname={pathname} />}
						</Section>
					</>
				)}

				{otherPersons.length > 0 && (
					<>
						{(hasBio || hasContributions || hasArticles) && <Separator />}
						<Section title={t('person.more-people')}>
							<PersonCarousel persons={otherPersons} personLink={{ lang, currency }} size="small" roleLabels={roleLabels} />
						</Section>
					</>
				)}
			</JournalPageShell>
		</>
	);
};
