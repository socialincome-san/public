import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import { JournalPageShell } from '@/components/storyblok/journal/journal-page-shell';
import { MoreArticlesButton } from '@/components/storyblok/journal/more-articles-button';
import { getDurationLabels } from '@/components/storyblok/shared/person-card';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import {
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getOptionCode,
	getPersonCircles,
	getPersonDisplayName,
	getPersonGitHubUrl,
	getPersonLinkedInUrl,
	getRoleLabel,
} from '@/lib/storyblok/storyblok-utils';
import { HOURS_RANGE_REGEX } from '@/lib/utils/regex';
import type { PersonContribution } from '@/modules/community/community.types';
import type { JournalArticle } from '@/modules/journal/journal.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { ShowMoreToggle } from '@socialincome/design-system/actions/show-more-toggle/show-more-toggle';
import { DurationBadge } from '@socialincome/design-system/data-display/duration-badge/duration-badge';
import { LinkList } from '@socialincome/design-system/data-display/link-list/link-list';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { TagList } from '@socialincome/design-system/data-display/tag-list/tag-list';
import { GithubIcon, LinkedinIcon } from '@socialincome/design-system/icons/social-icons/social-icons';
import { AsideSection } from '@socialincome/design-system/layout/aside-section/aside-section';
import { ProfileHeader } from '@socialincome/design-system/layout/profile-header/profile-header';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';
import { ExternalLinkIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';

const PERSON_PORTRAIT_WIDTH = 640;
const PERSON_PORTRAIT_HEIGHT = 800;
const ARTICLES_PREVIEW_COUNT = 3;

type Props = {
	breadcrumbs: BreadcrumbLinkType[];
	person: ISbStoryData<Person>;
	articles: ISbStoryData<JournalArticle>[];
	contributions: PersonContribution[];
	otherPersons: ISbStoryData<Person>[];
	lang: string;
	currency: WebsiteCurrency;
	pathname: string;
	showMoreArticlesLink: boolean;
	roleLabels: Record<string, string>;
	circleLabels: Record<string, string>;
	timeCommitmentLabels: Record<string, string>;
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
	breadcrumbs,
	person,
	articles,
	contributions,
	otherPersons,
	lang,
	currency,
	pathname,
	showMoreArticlesLink,
	roleLabels,
	circleLabels,
	timeCommitmentLabels,
	todayMs,
}: Props) => {
	const t = useTranslations('website-journal');
	const tCommon = useTranslations('website-common');
	const locale = useLocale();
	const { avatar, bio, firstName, githubName, linkedinName, primaryRole, volunteerSince, volunteerStatus } = person.content;
	const name = getPersonDisplayName(person);
	const shortName = firstName?.trim() || name;
	const duration = volunteerStatus === 'active' ? getDurationLabels(volunteerSince, locale, todayMs, tCommon) : null;
	const portraitSrc = avatar?.filename
		? formatStoryblokUrl(avatar.filename, PERSON_PORTRAIT_WIDTH, PERSON_PORTRAIT_HEIGHT, avatar.focus)
		: null;

	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const since = formatStoryblokDateMedium(volunteerSince, locale);
	// The `time-commitment` datasource stores the English display text as the entry value
	const timeCommitment = getOptionCode(person.content.timeCommitment);
	const timeCommitmentLabel = timeCommitmentLabels[timeCommitment] ?? timeCommitment;
	const facts = [
		...(roleLabel ? [{ label: t('person.role'), value: roleLabel }] : []),
		...(since ? [{ label: t('person.volunteering-since'), value: since }] : []),
		...(timeCommitment
			? [
					{
						label: t('person.time-commitment'),
						value: HOURS_RANGE_REGEX.test(timeCommitment)
							? `${timeCommitmentLabel} ${t('person.time-commitment-unit')}`
							: timeCommitmentLabel,
					},
				]
			: []),
	];
	const circles = getPersonCircles(person.content, circleLabels)
		.filter((circle) => circle.status === 'active')
		.map((circle) => circle.label);

	const roleCounts = new Map<string, number>();
	contributions
		.flatMap((contribution) => contribution.roles)
		.forEach((role) => {
			roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
		});

	const externalLinkCue = (
		<>
			<ExternalLinkIcon aria-hidden />
			<span className="sr-only">{t('person.opens-in-new-tab')}</span>
		</>
	);

	return (
		<JournalPageShell>
			<JournalBreadcrumb links={breadcrumbs} />

			<ProfileHeader
				name={name}
				description={bio?.trim()}
				image={portraitSrc ? { src: portraitSrc, alt: avatar?.alt ?? name } : null}
				imageBadge={duration && <DurationBadge label={duration.label} since={duration.since} />}
				facts={facts}
				tags={{ label: t('person.circles'), items: circles }}
				actions={
					linkedinName || githubName ? (
						<>
							{linkedinName && (
								<Button asChild size="sm" variant="outline">
									<Link href={getPersonLinkedInUrl(linkedinName)} target="_blank" rel="noopener noreferrer">
										<LinkedinIcon />
										LinkedIn
										{externalLinkCue}
									</Link>
								</Button>
							)}
							{githubName && (
								<Button asChild size="sm" variant="outline">
									<Link href={getPersonGitHubUrl(githubName)} target="_blank" rel="noopener noreferrer">
										<GithubIcon />
										GitHub
										{externalLinkCue}
									</Link>
								</Button>
							)}
						</>
					) : null
				}
			/>

			{contributions.length > 0 && (
				<>
					<Separator />
					<AsideSection
						title={t('person.contributions-title')}
						description={t('person.contributions-description', { name: shortName, count: contributions.length })}
						aside={<TagList items={[...roleCounts].map(([label, count]) => ({ label, count }))} />}
					>
						<LinkList
							items={contributions.map((contribution) => ({
								label: contribution.title,
								href: contribution.href,
								tags: contribution.roles,
							}))}
							showMoreLabel={t('person.contributions-show-all', { count: contributions.length })}
							showLessLabel={t('person.contributions-show-fewer')}
						/>
					</AsideSection>
				</>
			)}

			{articles.length > 0 && (
				<>
					<Separator />
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
					<Separator />
					<Section title={t('person.more-people')}>
						<PersonCarousel persons={otherPersons} personLink={{ lang, currency }} size="small" roleLabels={roleLabels} />
					</Section>
				</>
			)}
		</JournalPageShell>
	);
};
