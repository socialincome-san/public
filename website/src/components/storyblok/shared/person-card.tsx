import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getRoleLabel,
	getVolunteerDurationParts,
	type VolunteerDurationParts,
} from '@/lib/storyblok/storyblok-utils';
import { PersonCard as DesignSystemPersonCard } from '@socialincome/design-system/data-display/person-card/person-card';
import type { ISbStoryData } from '@storyblok/js';
import { useLocale, useTranslations } from 'next-intl';

const PERSON_CARD_IMAGE_WIDTH = 400;
const PERSON_CARD_IMAGE_HEIGHT = 500;

type Props = {
	person: ISbStoryData<Person>;
	href?: string;
	// 'small' and 'compact' are this component's own visual tiers (also used by the person carousel);
	// the person grid's medium/small cards map onto them — see PersonCardGrid's MEDIUM_CARDS/SMALL_CARDS.
	size?: 'default' | 'small' | 'compact';
	// Enables the "volunteering since" pill (on active volunteers with a start date).
	showVolunteerDuration?: boolean;
	roleLabels?: Record<string, string>;
};

type PersonCardTranslator = ReturnType<typeof useTranslations<'website-common'>>;

const formatDuration = (parts: VolunteerDurationParts, t: PersonCardTranslator) => {
	if (parts.unit === 'days') {
		// A "0 days" count would read badly, so day zero gets its own label.
		if (parts.days === 0) {
			return t('person-grid.duration-started-today');
		}

		return parts.days === 1
			? t('person-grid.duration-day-singular', { count: parts.days })
			: t('person-grid.duration-day-plural', { count: parts.days });
	}

	// The anniversary labels are used on the exact day a whole month (first year) or whole year is reached.
	if (parts.unit === 'months') {
		const count = parts.months;

		if (parts.isAnniversary) {
			return count === 1
				? t('person-grid.duration-month-anniversary-singular', { count })
				: t('person-grid.duration-month-anniversary-plural', { count });
		}

		return count === 1
			? t('person-grid.duration-month-singular', { count })
			: t('person-grid.duration-month-plural', { count });
	}

	const count = parts.years;

	if (parts.isAnniversary) {
		return count === 1
			? t('person-grid.duration-year-anniversary-singular', { count })
			: t('person-grid.duration-year-anniversary-plural', { count });
	}

	return count === 1 ? t('person-grid.duration-year-singular', { count }) : t('person-grid.duration-year-plural', { count });
};

const getDurationLabels = (volunteerSince: string | undefined, lang: string, t: PersonCardTranslator) => {
	const parts = getVolunteerDurationParts(volunteerSince, lang);

	return parts
		? {
				label: formatDuration(parts, t),
				since: t('person-grid.duration-since', { date: formatStoryblokDateMedium(volunteerSince, lang) }),
			}
		: null;
};

export const PersonCard = ({ person, href, size = 'default', showVolunteerDuration = false, roleLabels }: Props) => {
	const t = useTranslations('website-common');
	const lang = useLocale();
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
				showVolunteerDuration && size !== 'compact' && volunteerStatus === 'active'
					? getDurationLabels(volunteerSince, lang, t)
					: null
			}
		/>
	);
};
