import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { SectionHeading } from '@/components/section-heading';
import { PersonCommitmentCard, type PersonCommitmentDetail } from '@/components/storyblok/journal/person-commitment-card';
import { getDurationLabels, type VolunteerDurationConfig } from '@/components/storyblok/shared/person-card';
import { GithubIcon } from '@/components/svg/github';
import { LinkedinIcon } from '@/components/svg/linkedin';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	getOptionCode,
	getPersonCircles,
	getPersonGitHubUrl,
	getPersonLinkedInUrl,
	getRoleLabel,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { HOURS_RANGE_REGEX } from '@/lib/utils/regex';
import type { ISbStoryData } from '@storyblok/js';
import { CircleIcon, UsersIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const labelClassName = 'text-muted-foreground text-xs';

export type PersonProfileTranslations = {
	// Heading above the circle pills.
	circles: string;
	// Membership status of a circle pill, shown as its tooltip.
	activeCircle: string;
	interestedCircle: string;
	// Title of the volunteer commitment card and of the dialog it opens.
	commitment: string;
	// Labels for the facts inside the volunteer commitment card.
	workStyle: string;
	likesDeadline: string;
	likesDeadlineYes: string;
	likesDeadlineNo: string;
	timeCommitment: string;
	// Unit shown after a numeric time commitment, e.g. "4-8" + "hrs / week".
	timeCommitmentUnit: string;
};

type Props = {
	person: ISbStoryData<Person>;
	name: string;
	portraitSrc: string | null;
	roleLabels?: Record<string, string>;
	circleLabels?: Record<string, string>;
	translations: PersonProfileTranslations;
	// Presence enables the "volunteering since" pill on the portrait, as on the person cards.
	volunteerDuration?: VolunteerDurationConfig;
};

export const PersonProfileHeader = ({
	person,
	name,
	portraitSrc,
	roleLabels,
	circleLabels,
	translations,
	volunteerDuration,
}: Props) => {
	const { avatar, bio, githubName, likesDeadline, linkedinName, primaryRole, volunteerSince, volunteerStatus } =
		person.content;
	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const circles = getPersonCircles(person, circleLabels);
	const bioText = bio?.trim();
	const duration =
		volunteerDuration && volunteerStatus === 'active' ? getDurationLabels(volunteerSince, volunteerDuration) : null;

	// The `work-style` and `time-commitment` datasources store the display text as the entry value,
	// so the stored value is shown as is. An unset boolean stays hidden, while an explicit `false`
	// is a statement about the person and is shown.
	const workStyle = getOptionCode(person.content.workStyle);
	const timeCommitment = getOptionCode(person.content.timeCommitment);
	// Only the time commitment is on the card itself — the rest is a click away, since it speaks to
	// volunteers rather than to a first-time visitor.
	const commitmentDetails: PersonCommitmentDetail[] = [
		...(workStyle ? [{ label: translations.workStyle, value: workStyle }] : []),
		...(typeof likesDeadline === 'boolean'
			? [
					{
						label: translations.likesDeadline,
						value: likesDeadline ? translations.likesDeadlineYes : translations.likesDeadlineNo,
					},
				]
			: []),
	];
	const hasCirclesCard = Boolean(roleLabel) || circles.length > 0;
	const hasCommitmentCard = Boolean(timeCommitment) || commitmentDetails.length > 0;

	return (
		<header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
			{portraitSrc && (
				<div className="bg-muted relative mx-auto aspect-4/5 w-44 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-48">
					{duration && (
						<Badge
							variant="default"
							// Hover-only content is invisible to assistive tech, so the date rides along as the accessible
							// description; an aria-label would instead replace the duration as the accessible name.
							title={duration.since}
							className="group/duration text-foreground absolute top-3 left-3 z-20 border-white/40 bg-white/80 whitespace-nowrap backdrop-blur-sm"
						>
							<span className="group-hover/duration:hidden">{duration.label}</span>
							<span className="hidden group-hover/duration:inline">{duration.since}</span>
						</Badge>
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

			<div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
				<div className="space-y-2">
					<SectionHeading as="h1" size={1} align="left" bold className="text-foreground mb-0 leading-tight md:mb-0">
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

				{/* A lone card fills the row rather than leaving half of it empty. */}
				{(hasCirclesCard || hasCommitmentCard) && (
					<div className={cn('grid gap-4', hasCirclesCard && hasCommitmentCard && 'sm:grid-cols-2')}>
						{hasCirclesCard && (
							<Card variant="noPadding" className="h-full px-6 py-4">
								<UsersIcon className="text-muted-foreground mx-auto size-4 sm:mx-0" />
								{roleLabel && <p className="mt-2 text-xl">{roleLabel}</p>}
								{circles.length > 0 && (
									<>
										<p className={cn(labelClassName, 'mt-2')}>{translations.circles}</p>
										<div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
											{circles.map((circle) => (
												<Badge
													key={`${circle.status}-${circle.code}`}
													variant={circle.status === 'active' ? 'circle' : 'circle-outline'}
													title={circle.status === 'active' ? translations.activeCircle : translations.interestedCircle}
												>
													<CircleIcon className="size-3 shrink-0" aria-hidden="true" />
													{circle.label}
												</Badge>
											))}
										</div>
									</>
								)}
							</Card>
						)}
						{hasCommitmentCard && (
							<PersonCommitmentCard
								title={translations.commitment}
								value={timeCommitment}
								unit={HOURS_RANGE_REGEX.test(timeCommitment) ? translations.timeCommitmentUnit : undefined}
								details={commitmentDetails}
							/>
						)}
					</div>
				)}

				{bioText && <p className="text-foreground max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">{bioText}</p>}
			</div>
		</header>
	);
};
