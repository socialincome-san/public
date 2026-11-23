import { CountryFlag } from '@/components/country-flag';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { PersonBio } from '@/components/storyblok/journal/person-bio';
import { PersonHero } from '@/components/storyblok/journal/person-hero';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { getBioSegments } from '@/lib/storyblok/person-bio';
import { getPersonAvatarSrc, getPersonDisplayName, getPersonFirstName } from '@/lib/storyblok/storyblok-utils';
import type { JournalPersonPageData } from '@/modules/journal/journal.types';
import { ShowMoreToggle } from '@socialincome/design-system/actions/show-more-toggle/show-more-toggle';
import {
	ContributionCard,
	ContributionCardPerson,
} from '@socialincome/design-system/data-display/contribution-card/contribution-card';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

const ARTICLES_PREVIEW_COUNT = 3;

type Props = Pick<
	JournalPersonPageData,
	| 'person'
	| 'articles'
	| 'contributions'
	| 'assessments'
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
	assessments,
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
	const personName = getPersonDisplayName(person);
	const contributionPerson = () => (
		<ContributionCardPerson name={shortName} fullName={personName} imageSrc={getPersonAvatarSrc(person)} />
	);
	const bold = (chunks: ReactNode) => <strong>{chunks}</strong>;
	const contributionCardLabels = {
		// The card fills in the numbers as rows are revealed
		showMoreLabel: t('person.contributions-show-more', { count: '{count}' }),
		counterLabel: t('person.contributions-counter', { shown: '{shown}', total: '{total}' }),
	};
	const hasContributions = contributions.length > 0 || assessments.length > 0;
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
						<Section title={t('person.contributions-title')}>
							{/* One card per kind of contribution; they sit side by side where there is room */}
							<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-3 sm:gap-4">
								{contributions.length > 0 && (
									<ContributionCard
										summary={t.rich('person.contributions-pages', {
											count: contributions.length,
											person: contributionPerson,
											b: bold,
										})}
										items={contributions.map((contribution) => ({
											title: contribution.title,
											href: contribution.href,
											badges: contribution.roles,
										}))}
										{...contributionCardLabels}
									/>
								)}
								{assessments.length > 0 && (
									<ContributionCard
										summary={t.rich('person.contributions-assessments', {
											count: assessments.length,
											person: contributionPerson,
											b: bold,
										})}
										items={assessments.map((assessment) => ({
											title: assessment.title,
											href: assessment.href,
											icon: assessment.countryCode ? (
												<CountryFlag country={assessment.countryCode} size="md" decorative />
											) : undefined,
											badges: assessment.roles.map((role) => t(`person.contributions-assessment-${role}`)),
										}))}
										{...contributionCardLabels}
									/>
								)}
							</div>
						</Section>
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
