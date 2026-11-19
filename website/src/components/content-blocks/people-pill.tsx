import { blockMargins } from '@/components/content-blocks/block-margins';
import { getStoryUuids } from '@/components/content-blocks/overview-grid.utils';
import { pickPillCircle } from '@/components/content-blocks/people-pill.utils';
import type { PeoplePill, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import {
	createWebsitePersonLink,
	formatStoryblokMonthYear,
	getPersonAvatarSrc,
	getPersonCircles,
	getRoleLabel,
} from '@/lib/storyblok/storyblok-utils';
import { toCountryCode } from '@/lib/types/country';
import {
	getCircleLabelsAction,
	getPersonsByUuidsAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { cn } from '@socialincome/design-system/cn';
import { PersonPill } from '@socialincome/design-system/data-display/person-pill/person-pill';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

const MAX_PEOPLE = 3;

type Props = {
	blok: PeoplePill;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	// On the page of a circle, the pills name that circle
	circleSlug?: string;
	// On a page the block has margins of its own, in a journal article it sits in the text column
	placement?: 'page' | 'article';
};

type Subline = {
	subline?: string;
	sublineSuffix?: string;
	sublineLabel?: string;
};

export const PeoplePillBlock = async ({ blok, lang, currency, circleSlug, placement = 'page' }: Props) => {
	const uuids = getStoryUuids(blok.people).slice(0, MAX_PEOPLE);
	if (uuids.length === 0) {
		return null;
	}
	// Storyblok stores an unselected option as ''
	const sublineType = blok.subline === undefined || blok.subline === '' ? 'role' : blok.subline;
	const [personsResult, roleLabelsResult, circleLabelsResult, t, tCountries] = await Promise.all([
		getPersonsByUuidsAction({ language: lang, values: uuids }),
		sublineType === 'role' ? getPrimaryRoleLabelsAction(lang) : null,
		sublineType === 'circle' ? getCircleLabelsAction(lang) : null,
		getTranslations('website-common'),
		getTranslations('countries'),
	]);
	const persons = personsResult.success ? personsResult.data : [];
	if (persons.length === 0) {
		return null;
	}
	const roleLabels = roleLabelsResult?.success ? roleLabelsResult.data : undefined;
	const circleLabels = circleLabelsResult?.success ? circleLabelsResult.data : undefined;

	// A person without a value for the chosen subline shows the name only
	const getSubline = ({ content }: ISbStoryData<Person>): Subline => {
		switch (sublineType) {
			case 'role':
				return { subline: getRoleLabel(content.primaryRole, roleLabels) };
			case 'country': {
				const code = toCountryCode(content.country === undefined ? undefined : String(content.country));

				return { subline: code ? tCountries(code) : undefined };
			}
			case 'volunteerSince': {
				const date = formatStoryblokMonthYear(content.volunteerSince, lang);

				return { subline: date ? t('people-pill.volunteer-since', { date }) : undefined };
			}
			case 'circle': {
				const circle = pickPillCircle(getPersonCircles(content, circleLabels), circleSlug);
				if (!circle) {
					return {};
				}

				return circle.moreCount > 0
					? {
							subline: circle.label,
							sublineSuffix: `+${circle.moreCount}`,
							sublineLabel: t('people-pill.circle-more', { circle: circle.label, count: circle.moreCount }),
						}
					: { subline: circle.label };
			}
		}
	};

	const isCentered = blok.alignment === 'center';
	const pills = (
		<ul
			className={cn(
				'flex flex-col gap-3 sm:flex-row sm:flex-wrap',
				isCentered ? 'items-center sm:justify-center' : 'items-start sm:justify-start',
			)}
		>
			{persons.map((person) => {
				const avatarSrc = getPersonAvatarSrc(person);
				const { firstName, lastName, fullName } = person.content;

				return (
					<li key={person.uuid} className="flex max-w-full">
						<PersonPill
							firstName={firstName || fullName}
							// The full name already ends with the last name
							lastName={firstName ? lastName : undefined}
							image={avatarSrc ? { src: avatarSrc, alt: '' } : null}
							href={createWebsitePersonLink(person.slug, lang, currency)}
							{...getSubline(person)}
						/>
					</li>
				);
			})}
		</ul>
	);

	if (placement === 'article') {
		// `not-prose` keeps the article's text styles off the list, links and portraits
		return (
			<div className="not-prose my-8" {...storyblokEditable(blok)}>
				{pills}
			</div>
		);
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			{pills}
		</BlockWrapper>
	);
};
