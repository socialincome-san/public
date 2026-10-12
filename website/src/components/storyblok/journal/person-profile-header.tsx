import { getDurationLabels } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	getOptionCode,
	getPersonCircles,
	getPersonGitHubUrl,
	getPersonLinkedInUrl,
	getRoleLabel,
} from '@/lib/storyblok/storyblok-utils';
import { HOURS_RANGE_REGEX } from '@/lib/utils/regex';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { DurationBadge } from '@socialincome/design-system/data-display/duration-badge/duration-badge';
import { FactCard } from '@socialincome/design-system/data-display/fact-card/fact-card';
import { GithubIcon, LinkedinIcon } from '@socialincome/design-system/icons/social-icons/social-icons';
import { ProfileHeader } from '@socialincome/design-system/layout/profile-header/profile-header';
import type { ISbStoryData } from '@storyblok/js';
import { CircleIcon, ExternalLinkIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
	person: ISbStoryData<Person>;
	name: string;
	portraitSrc: string | null;
	roleLabels?: Record<string, string>;
	circleLabels?: Record<string, string>;
	workStyleLabels?: Record<string, string>;
	timeCommitmentLabels?: Record<string, string>;
};

export const PersonProfileHeader = ({
	person,
	name,
	portraitSrc,
	roleLabels,
	circleLabels,
	workStyleLabels,
	timeCommitmentLabels,
}: Props) => {
	const t = useTranslations('website-journal');
	const tCommon = useTranslations('website-common');
	const lang = useLocale();
	const { avatar, bio, githubName, likesDeadline, linkedinName, primaryRole, volunteerSince, volunteerStatus } =
		person.content;
	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const circles = getPersonCircles(person.content, circleLabels);
	const duration = volunteerStatus === 'active' ? getDurationLabels(volunteerSince, lang, tCommon) : null;

	// The `work-style` and `time-commitment` datasources store the English display text as the entry value.
	// An unset boolean stays hidden, while an explicit `false` is a statement about the person and is shown.
	const workStyle = getOptionCode(person.content.workStyle);
	const timeCommitment = getOptionCode(person.content.timeCommitment);
	const timeCommitmentLabel = timeCommitmentLabels?.[timeCommitment] ?? timeCommitment;
	const commitmentFacts = [
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
		...(workStyle ? [{ label: t('person.work-style'), value: workStyleLabels?.[workStyle] ?? workStyle }] : []),
		...(typeof likesDeadline === 'boolean'
			? [
					{
						label: t('person.likes-deadline'),
						value: likesDeadline ? t('person.likes-deadline-yes') : t('person.likes-deadline-no'),
					},
				]
			: []),
	];
	// The first commitment fact is shown on the card, all of them in its dialog
	const [commitmentFact, ...commitmentDetails] = commitmentFacts;

	const externalLinkCue = (
		<>
			<ExternalLinkIcon aria-hidden />
			<span className="sr-only">{t('person.opens-in-new-tab')}</span>
		</>
	);

	return (
		<ProfileHeader
			name={name}
			image={portraitSrc ? { src: portraitSrc, alt: avatar?.alt ?? name } : null}
			imageBadge={duration && <DurationBadge label={duration.label} since={duration.since} />}
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
			description={bio?.trim()}
		>
			{roleLabel ? <FactCard label={t('person.role')} value={roleLabel} /> : null}
			{commitmentFact && (
				<FactCard
					label={commitmentFact.label}
					value={commitmentFact.value}
					details={{ title: t('person.commitment'), facts: commitmentDetails }}
				/>
			)}
			{circles.length > 0 && (
				<FactCard label={t('person.circles')}>
					<div className="flex flex-wrap gap-2">
						{circles.map((circle) => {
							const status = circle.status === 'active' ? t('person.circle-active') : t('person.circle-interested');

							return (
								<Badge
									key={`${circle.status}-${circle.code}`}
									variant={circle.status === 'active' ? 'primary' : 'primary-outline'}
									size="lg"
									title={status}
								>
									<CircleIcon className="size-3 shrink-0" aria-hidden="true" />
									{circle.label}
									<span className="sr-only">({status})</span>
								</Badge>
							);
						})}
					</div>
				</FactCard>
			)}
		</ProfileHeader>
	);
};
