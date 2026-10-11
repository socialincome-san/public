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
import { cn } from '@socialincome/design-system/cn';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { DurationBadge } from '@socialincome/design-system/data-display/duration-badge/duration-badge';
import { FactCard } from '@socialincome/design-system/data-display/fact-card/fact-card';
import { GithubIcon, LinkedinIcon } from '@socialincome/design-system/icons/social-icons/social-icons';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';
import { CircleIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
	person: ISbStoryData<Person>;
	name: string;
	portraitSrc: string | null;
	roleLabels?: Record<string, string>;
	circleLabels?: Record<string, string>;
};

export const PersonProfileHeader = ({ person, name, portraitSrc, roleLabels, circleLabels }: Props) => {
	const t = useTranslations('website-journal');
	const tCommon = useTranslations('website-common');
	const lang = useLocale();
	const { avatar, bio, githubName, likesDeadline, linkedinName, primaryRole, volunteerSince, volunteerStatus } =
		person.content;
	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const circles = getPersonCircles(person.content, circleLabels);
	const bioText = bio?.trim();
	const duration = volunteerStatus === 'active' ? getDurationLabels(volunteerSince, lang, tCommon) : null;

	// The `work-style` and `time-commitment` datasources store the display text as the entry value. An unset
	// boolean stays hidden, while an explicit `false` is a statement about the person and is shown.
	const workStyle = getOptionCode(person.content.workStyle);
	const timeCommitment = getOptionCode(person.content.timeCommitment);
	const commitmentDetails = [
		...(workStyle ? [{ label: t('person.work-style'), value: workStyle }] : []),
		...(typeof likesDeadline === 'boolean'
			? [
					{
						label: t('person.likes-deadline'),
						value: likesDeadline ? t('person.likes-deadline-yes') : t('person.likes-deadline-no'),
					},
				]
			: []),
	];
	const hasCommitmentCard = Boolean(timeCommitment) || commitmentDetails.length > 0;
	const cardCount = [Boolean(roleLabel), hasCommitmentCard, circles.length > 0].filter(Boolean).length;

	return (
		<header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
			{portraitSrc && (
				<div className="bg-muted relative mx-auto aspect-4/5 w-44 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-48">
					{duration && (
						<div className="absolute top-3 left-3 z-20">
							<DurationBadge label={duration.label} since={duration.since} />
						</div>
					)}
					<Image
						src={portraitSrc}
						alt={avatar?.alt ?? name}
						fill
						sizes="(min-width: 640px) 192px, 176px"
						className="object-cover object-top"
						priority
					/>
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col gap-6 text-center sm:text-left">
				<div className="flex flex-col gap-4">
					<SectionHeading as="h1" size={1} align="left" bold>
						{name}
					</SectionHeading>
					{(linkedinName ?? githubName) && (
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							{linkedinName && (
								<Button asChild size="sm" variant="outline">
									<Link href={getPersonLinkedInUrl(linkedinName)} target="_blank" rel="noopener noreferrer">
										<LinkedinIcon />
										LinkedIn
									</Link>
								</Button>
							)}
							{githubName && (
								<Button asChild size="sm" variant="outline">
									<Link href={getPersonGitHubUrl(githubName)} target="_blank" rel="noopener noreferrer">
										<GithubIcon />
										GitHub
									</Link>
								</Button>
							)}
						</div>
					)}
				</div>

				{/* All three cards share a row where there is room; in between, circles span a row of their own
				below the other two. A lone card fills the row rather than leaving half of it empty. */}
				{cardCount > 0 && (
					<div
						className={cn('grid gap-4 text-left', cardCount > 1 && 'sm:grid-cols-2', cardCount === 3 && 'lg:grid-cols-3')}
					>
						{roleLabel && <FactCard label={t('person.role')} value={roleLabel} />}
						{hasCommitmentCard && (
							<FactCard
								label={timeCommitment ? t('person.time-commitment') : t('person.commitment')}
								value={
									HOURS_RANGE_REGEX.test(timeCommitment)
										? `${timeCommitment} ${t('person.time-commitment-unit')}`
										: timeCommitment
								}
								details={{ title: t('person.commitment'), facts: commitmentDetails }}
							/>
						)}
						{circles.length > 0 && (
							<div className={cn(cardCount === 3 && 'sm:col-span-2 lg:col-span-1')}>
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
							</div>
						)}
					</div>
				)}

				{bioText && <p className="text-foreground max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">{bioText}</p>}
			</div>
		</header>
	);
};
