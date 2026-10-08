import { getStoryUuids } from '@/components/content-blocks/overview-grid.utils';
import { PersonCardGrid } from '@/components/storyblok/shared/person-card-grid';
import { PersonGridInteractive } from '@/components/storyblok/shared/person-grid-interactive';
import type { Person, PersonGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { personHasRole, resolveStoryblokLink, toStringArray } from '@/lib/storyblok/storyblok-utils';
import {
	getAllPersonsAction,
	getPersonsByCountryOfficeAction,
	getPersonsByUuidsAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: PersonGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const matchesStatusFilter = (person: ISbStoryData<Person>, statusFilter: string) =>
	statusFilter === 'all' || statusFilter === person.content.volunteerStatus;

const matchesRoleFilter = (person: ISbStoryData<Person>, roleFilterCodes: string[]) =>
	roleFilterCodes.length === 0 || personHasRole(person, roleFilterCodes);

const isRoleExcluded = (person: ISbStoryData<Person>, roleExcludeCodes: string[]) =>
	roleExcludeCodes.length > 0 && personHasRole(person, roleExcludeCodes);

const isCountryOfficeMember = (person: ISbStoryData<Person>) => Boolean(person.content.countryOffice?.length);

export const PersonGridBlock = async ({ blok, lang, region }: Props) => {
	const manualUuids = getStoryUuids(blok.persons);
	const countryOfficeCodes = toStringArray(blok.countryOffice);
	const roleFilterCodes = toStringArray(blok.roleFilter);
	const roleExcludeCodes = toStringArray(blok.roleExcludeFilter);
	const excludeCountryOfficeMembers = blok.excludeCountryOfficeMembers ?? false;

	const statusFilter = blok.statusFilter ?? 'all';
	const smallCards = blok.smallCards ?? false;
	const linkToPersonPage = blok.linkToPersonPage ?? false;
	const showVolunteerDuration = blok.showVolunteerDuration ?? false;
	const showSearch = blok.showSearch ?? false;
	const showSort = blok.showSort ?? false;
	const showFilterPills = blok.showFilterPills ?? false;
	const isInteractive = showSearch || showSort || showFilterPills;

	const [personsResult, roleLabelsResult] = await Promise.all([
		manualUuids.length
			? getPersonsByUuidsAction({ language: lang, values: manualUuids })
			: countryOfficeCodes.length
				? getPersonsByCountryOfficeAction({ language: lang, values: countryOfficeCodes })
				: getAllPersonsAction(lang),
		getPrimaryRoleLabelsAction(lang),
	]);
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
	// Exclusions run before everything else — manual picks, role/status filters and the interactive
	// filter pills all work on this set, so a role excluded here can never surface.
	const allPersons = (personsResult.success ? personsResult.data : []).filter(
		(person) => !isRoleExcluded(person, roleExcludeCodes) && !(excludeCountryOfficeMembers && isCountryOfficeMember(person)),
	);

	// Manual picks bypass the role/status filters — an explicitly chosen person always shows up.
	const persons = manualUuids.length
		? allPersons
		: allPersons.filter((person) => matchesRoleFilter(person, roleFilterCodes) && matchesStatusFilter(person, statusFilter));

	if (persons.length === 0) {
		return null;
	}

	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	const content = isInteractive ? (
		<PersonGridInteractive
			persons={persons}
			lang={lang}
			region={region}
			smallCards={smallCards}
			linkToPersonPage={linkToPersonPage}
			showVolunteerDuration={showVolunteerDuration}
			roleLabels={roleLabels}
			showSearch={showSearch}
			showSort={showSort}
			showFilterPills={showFilterPills}
		/>
	) : (
		<PersonCardGrid
			persons={persons}
			lang={lang}
			region={region}
			smallCards={smallCards}
			linkToPersonPage={linkToPersonPage}
			showVolunteerDuration={showVolunteerDuration}
			roleLabels={roleLabels}
		/>
	);

	return (
		<BlockWrapper
			{...storyblokEditable(blok)}
			disableMarginTop={blok.disableMarginTop}
			disableMarginBottom={blok.disableMarginBottom}
		>
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
