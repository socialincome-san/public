import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getRoleLabel,
	getVolunteerDurationParts,
	type VolunteerDurationParts,
} from '@/lib/storyblok/storyblok-utils';
import { PersonCard as DesignSystemPersonCard } from '@socialincome/design-system/data-display/person-card/person-card';
import type { ISbStoryData } from '@storyblok/js';

const PERSON_CARD_IMAGE_WIDTH = 400;
const PERSON_CARD_IMAGE_HEIGHT = 500;

// Every label is a "{count}" template rather than a translator call, because the person card also
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
	// Presence enables the "volunteering since" pill (on active volunteers with a start date).
	volunteerDuration?: VolunteerDurationConfig;
	roleLabels?: Record<string, string>;
};

const pluralize = (count: number, singular: string, plural: string) =>
	(count === 1 ? singular : plural).replace('{count}', String(count));

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
				since: config.translations.since.replace('{date}', formatStoryblokDateMedium(volunteerSince, config.lang)),
			}
		: null;
};

export const PersonCard = ({ person, href, size = 'default', volunteerDuration, roleLabels }: Props) => {
	const { avatar, firstName, fullName, lastName, primaryRole, volunteerStatus, volunteerSince } = person.content;

	return (
		<DesignSystemPersonCard
			firstName={firstName || fullName}
			lastName={lastName}
			roleLabel={getRoleLabel(primaryRole, roleLabels)}
			image={
				avatar?.filename
					? {
							src: formatStoryblokUrl(avatar.filename, PERSON_CARD_IMAGE_WIDTH, PERSON_CARD_IMAGE_HEIGHT, avatar.focus),
							alt: avatar.alt ?? fullName,
						}
					: null
			}
			href={href}
			size={size}
			duration={
				volunteerDuration && size !== 'compact' && volunteerStatus === 'active'
					? getDurationLabels(volunteerSince, volunteerDuration)
					: null
			}
		/>
	);
};
