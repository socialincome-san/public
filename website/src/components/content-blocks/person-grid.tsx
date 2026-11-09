import { blockMargins } from '@/components/content-blocks/block-margins';
import { getStoryUuids } from '@/components/content-blocks/overview-grid.utils';
import { PersonCardGrid } from '@/components/storyblok/shared/person-card-grid';
import { PersonCarousel } from '@/components/storyblok/shared/person-carousel';
import { PersonGridInteractive } from '@/components/storyblok/shared/person-grid-interactive';
import type { Person, PersonGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPersonCircles, personHasRole, resolveStoryblokLink, toStringArray } from '@/lib/storyblok/storyblok-utils';
import { getTodayMs } from '@/lib/utils/today';
import {
	getAllPersonsAction,
	getPersonsByCountryOfficeAction,
	getPersonsByUuidsAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: PersonGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

const matchesStatusFilter = (person: ISbStoryData<Person>, statusFilter: string) =>
	statusFilter === 'all' || statusFilter === person.content.volunteerStatus;

const matchesRoleFilter = (person: ISbStoryData<Person>, roleFilterCodes: string[]) =>
	roleFilterCodes.length === 0 || personHasRole(person, roleFilterCodes);

const isRoleExcluded = (person: ISbStoryData<Person>, roleExcludeCodes: string[]) =>
	roleExcludeCodes.length > 0 && personHasRole(person, roleExcludeCodes);

const isCountryOfficeMember = (person: ISbStoryData<Person>) => Boolean(person.content.countryOffice?.length);

// An unset membership ('') shows active and interested members alike
const matchesCircleFilter = (
	person: ISbStoryData<Person>,
	circleCodes: string[],
	membership: PersonGrid['circleMembership'],
) =>
	circleCodes.length === 0 ||
	getPersonCircles(person.content).some(
		(circle) => circleCodes.includes(circle.code) && (!membership || membership === 'all' || circle.status === membership),
	);

// People without a start date go last
const getVolunteerStartMs = (person: ISbStoryData<Person>) => {
	const startMs = person.content.volunteerSince ? Date.parse(person.content.volunteerSince) : NaN;

	return Number.isNaN(startMs) ? Infinity : startMs;
};

export const PersonGridBlock = async ({ blok, lang, currency }: Props) => {
	const manualUuids = getStoryUuids(blok.persons);
	const countryOfficeCodes = toStringArray(blok.countryOffice);
	const roleFilterCodes = toStringArray(blok.roleFilter);
	const roleExcludeCodes = toStringArray(blok.roleExcludeFilter);
	const circleCodes = toStringArray(blok.circleFilter);
	const excludeCountryOfficeMembers = blok.excludeCountryOfficeMembers ?? false;

	const statusFilter = blok.statusFilter ?? 'all';
	const smallCards = blok.smallCards ?? false;
	const linkToPersonPage = blok.linkToPersonPage ?? false;
	const showSearch = blok.showSearch ?? false;
	const showSort = blok.showSort ?? false;
	const showFilterPills = blok.showFilterPills ?? false;
	const displayAsCarousel = blok.displayAsCarousel ?? false;
	const isInteractive = !displayAsCarousel && (showSearch || showSort || showFilterPills);

	const [personsResult, roleLabelsResult, todayMs] = await Promise.all([
		manualUuids.length
			? getPersonsByUuidsAction({ language: lang, values: manualUuids })
			: countryOfficeCodes.length
				? getPersonsByCountryOfficeAction({ language: lang, values: countryOfficeCodes })
				: getAllPersonsAction(lang),
		getPrimaryRoleLabelsAction(lang),
		getTodayMs(),
	]);
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
	// Exclusions run before everything else — manual picks, role/status filters and the interactive
	// filter pills all work on this set, so a role excluded here can never surface.
	const allPersons = (personsResult.success ? personsResult.data : []).filter(
		(person) => !isRoleExcluded(person, roleExcludeCodes) && !(excludeCountryOfficeMembers && isCountryOfficeMember(person)),
	);

	// Manual picks bypass the role/status filters — an explicitly chosen person always shows up.
	const filteredPersons = manualUuids.length
		? allPersons
		: allPersons.filter(
				(person) =>
					matchesRoleFilter(person, roleFilterCodes) &&
					matchesStatusFilter(person, statusFilter) &&
					matchesCircleFilter(person, circleCodes, blok.circleMembership),
			);
	const persons =
		blok.sortBy === 'startDate'
			? [...filteredPersons].sort((first, second) => getVolunteerStartMs(first) - getVolunteerStartMs(second))
			: filteredPersons;

	if (persons.length === 0) {
		return null;
	}

	const volunteerDurationUntil = blok.showVolunteerDuration ? todayMs : undefined;
	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, currency) : null;

	const content = displayAsCarousel ? (
		<PersonCarousel
			persons={persons}
			personLink={linkToPersonPage ? { lang, currency } : undefined}
			size={smallCards ? 'small' : 'default'}
			roleLabels={roleLabels}
			volunteerDurationUntil={volunteerDurationUntil}
		/>
	) : isInteractive ? (
		<PersonGridInteractive
			persons={persons}
			lang={lang}
			currency={currency}
			smallCards={smallCards}
			linkToPersonPage={linkToPersonPage}
			volunteerDurationUntil={volunteerDurationUntil}
			roleLabels={roleLabels}
			showSearch={showSearch}
			showSort={showSort}
			showFilterPills={showFilterPills}
		/>
	) : (
		<PersonCardGrid
			persons={persons}
			lang={lang}
			currency={currency}
			smallCards={smallCards}
			linkToPersonPage={linkToPersonPage}
			volunteerDurationUntil={volunteerDurationUntil}
			roleLabels={roleLabels}
		/>
	);

	return (
		<BlockWrapper {...storyblokEditable(blok)} {...blockMargins(blok)}>
			{blok.title ? (
				<div className="mb-8">
					<SectionHeading align="left" size={4} bold>
						{blok.title}
					</SectionHeading>
				</div>
			) : null}
			{content}
			{button && buttonHref ? (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				</div>
			) : null}
		</BlockWrapper>
	);
};
