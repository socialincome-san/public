import { Badge } from '@/components/badge/badge';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getRoleLabel,
	getVolunteerDurationParts,
	type VolunteerDurationParts,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import NextImage from 'next/image';
import NextLink from 'next/link';

const PERSON_CARD_IMAGE_WIDTH = 400;
const PERSON_CARD_IMAGE_HEIGHT = 500;

// Every label is a "{{count}}" template rather than a translator call, because the person card also
// renders inside the client-side person grid where no translator instance is available.
export type VolunteerDurationTranslations = {
	// Standalone label for day zero, where a "0 days" count would read badly.
	startedToday: string;
	daySingular: string;
	dayPlural: string;
	monthSingular: string;
	monthPlural: string;
	yearSingular: string;
	yearPlural: string;
	// Used on the exact day a whole month (first year) or whole year is reached.
	monthAnniversarySingular: string;
	monthAnniversaryPlural: string;
	yearAnniversarySingular: string;
	yearAnniversaryPlural: string;
	// "Since {{date}}" template shown when hovering the pill.
	since: string;
};

export type VolunteerDurationConfig = {
	lang: WebsiteLanguage;
	translations: VolunteerDurationTranslations;
};

type Props = {
	person: ISbStoryData<Person>;
	href?: string;
	// 'small' and 'compact' are this component's own visual tiers (also used by the person carousel);
	// the person grid's medium/small cards map onto them — see PersonCardGrid's MEDIUM_CARDS/SMALL_CARDS.
	size?: 'default' | 'small' | 'compact';
	className?: string;
	// Presence enables the "volunteering since" pill (on active volunteers with a start date).
	volunteerDuration?: VolunteerDurationConfig;
	roleLabels?: Record<string, string>;
};

const pluralize = (count: number, singular: string, plural: string) =>
	(count === 1 ? singular : plural).replace('{{count}}', String(count));

const formatDuration = (parts: VolunteerDurationParts, translations: VolunteerDurationTranslations) => {
	if (parts.unit === 'days') {
		return parts.days === 0
			? translations.startedToday
			: pluralize(parts.days, translations.daySingular, translations.dayPlural);
	}

	if (parts.unit === 'months') {
		return parts.isAnniversary
			? pluralize(parts.months, translations.monthAnniversarySingular, translations.monthAnniversaryPlural)
			: pluralize(parts.months, translations.monthSingular, translations.monthPlural);
	}

	return parts.isAnniversary
		? pluralize(parts.years, translations.yearAnniversarySingular, translations.yearAnniversaryPlural)
		: pluralize(parts.years, translations.yearSingular, translations.yearPlural);
};

const getDurationLabels = (volunteerSince: string | undefined, config: VolunteerDurationConfig) => {
	const parts = getVolunteerDurationParts(volunteerSince, config.lang);

	return parts
		? {
				label: formatDuration(parts, config.translations),
				since: config.translations.since.replace('{{date}}', formatStoryblokDateMedium(volunteerSince, config.lang)),
			}
		: null;
};

export const PersonCard = ({ person, href, size = 'default', className, volunteerDuration, roleLabels }: Props) => {
	const { avatar, firstName, fullName, lastName, primaryRole, volunteerStatus, volunteerSince } = person.content;
	const imageSource = avatar?.filename
		? formatStoryblokUrl(avatar.filename, PERSON_CARD_IMAGE_WIDTH, PERSON_CARD_IMAGE_HEIGHT, avatar.focus)
		: null;

	const isCompact = size === 'compact';
	const isSmall = size === 'small' || isCompact;
	const roleLabel = getRoleLabel(primaryRole, roleLabels);
	const showRole = roleLabel.length > 0 && !isCompact;

	const duration =
		volunteerDuration && !isCompact && volunteerStatus === 'active'
			? getDurationLabels(volunteerSince, volunteerDuration)
			: null;

	const card = (
		<div
			className={cn(
				'bg-card flex h-full w-full flex-col overflow-hidden rounded-xl shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]',
				isSmall ? 'max-w-[260px] p-2.5' : 'max-w-[305px] p-3',
				className,
			)}
		>
			<div
				className={cn(
					'bg-muted relative w-full overflow-hidden rounded-lg',
					isSmall ? 'aspect-[240/300]' : 'aspect-[280/350]',
				)}
			>
				{duration ? (
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
				) : null}
				{imageSource ? (
					<NextImage
						src={imageSource}
						alt={avatar?.alt ?? fullName}
						fill
						sizes={
							isSmall
								? '(min-width: 1280px) 240px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
								: '(min-width: 1280px) 281px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
						}
						className="object-cover"
					/>
				) : null}
				<svg
					className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 w-full"
					viewBox="0 0 279 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
				>
					<path
						d="M0 0H132.305C159.296 0 185.482 9.1858 206.558 26.0465C211.375 29.9004 217.361 32 223.53 32H279H0V0Z"
						fill="white"
						stroke="white"
						strokeWidth="1"
					/>
				</svg>
			</div>
			{/* Wrapping lets the role drop onto its own left-aligned line when the name needs the full
			    width — otherwise a long last name is squeezed to a sliver and spills under the role. The card
			    stretches to its grid row and `mb-auto` parks the slack below, so wrapping never changes the
			    card's height relative to its neighbours. */}
			<div
				className={cn(
					'relative z-20 mb-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-1 rounded-b-lg px-2 pb-3',
					isSmall ? '-mt-5 pt-2.5' : '-mt-6 pt-3',
				)}
			>
				<h3
					className={cn(
						'relative line-clamp-2 min-w-0 font-bold',
						isCompact
							? 'text-base leading-5'
							: isSmall
								? 'text-lg leading-6 sm:text-xl sm:leading-7'
								: 'text-xl leading-7 sm:text-2xl sm:leading-8',
					)}
				>
					{firstName || fullName}
					{lastName ? (
						<>
							<br />
							<span className="font-normal">{lastName}</span>
						</>
					) : null}
				</h3>
				{showRole ? (
					<p className={cn('relative max-w-full shrink-0 truncate pb-1 leading-none', isSmall ? 'text-xs' : 'text-sm')}>
						{roleLabel}
					</p>
				) : null}
			</div>
		</div>
	);

	if (!href) {
		return card;
	}

	return (
		<NextLink href={href} className={cn('block h-full w-full', isSmall ? 'max-w-[260px]' : 'max-w-[305px]', className)}>
			{card}
		</NextLink>
	);
};
