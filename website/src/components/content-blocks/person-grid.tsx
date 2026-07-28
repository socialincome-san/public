import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { getStoryUuids } from '@/components/content-blocks/overview-grid.utils';
import { PersonCardGrid } from '@/components/storyblok/shared/person-card-grid';
import { PersonGridInteractive } from '@/components/storyblok/shared/person-grid-interactive';
import type { Person, PersonGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { personHasRole, resolveStoryblokLink, toStringArray } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
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

// Excluded roles are enforced ahead of every other branch (manual picks, country office, role/status
// filters) so a role placed here — e.g. board members — can never surface regardless of how the rest
// of the block is configured or how a visitor toggles the interactive filter pills.
const matchesRoleExcludeFilter = (person: ISbStoryData<Person>, roleExcludeCodes: string[]) =>
	roleExcludeCodes.length === 0 || !personHasRole(person, roleExcludeCodes);

// Excludes anyone affiliated with a country office, regardless of which one — e.g. for a global/HQ
// team grid that should only show people without a country-office affiliation.
const matchesCountryOfficeExcludeFilter = (person: ISbStoryData<Person>, excludeCountryOfficeMembers: boolean) =>
	!excludeCountryOfficeMembers || (person.content.countryOffice?.length ?? 0) === 0;

export const PersonGridBlock = async ({ blok, lang, region }: Props) => {
	const manualUuids = getStoryUuids(blok.persons);
	const countryOfficeCodes = toStringArray(blok.countryOffice);
	const roleFilterCodes = toStringArray(blok.roleFilter);
	const roleExcludeCodes = toStringArray(blok.roleExcludeFilter);
	const excludeCountryOfficeMembers = blok.excludeCountryOfficeMembers ?? false;

	const statusFilter = blok.statusFilter ?? 'all';
	const limit = Number(blok.limit) || 0;
	const centerLastRow = blok.centerLastRow ?? false;
	const smallCards = blok.smallCards ?? false;
	const linkToPersonPage = blok.linkToPersonPage ?? false;
	const showVolunteerDuration = blok.showVolunteerDuration ?? false;
	const showSearch = blok.showSearch ?? false;
	const showSort = blok.showSort ?? false;
	const showFilterPills = blok.showFilterPills ?? false;
	const isInteractive = showSearch || showSort || showFilterPills;

	const [personsResult, translator, roleLabelsResult] = await Promise.all([
		manualUuids.length
			? services.storyblok.getPersonsByUuids(lang, manualUuids)
			: countryOfficeCodes.length
				? services.storyblok.getPersonsByCountryOffice(lang, countryOfficeCodes)
				: services.storyblok.getAllPersons(lang),
		isInteractive || showVolunteerDuration ? Translator.getInstance({ language: lang, namespaces: 'website-common' }) : null,
		services.storyblok.getPrimaryRoleLabels(lang),
	]);
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
	const allPersons = (personsResult.success ? personsResult.data : []).filter(
		(person) =>
			matchesRoleExcludeFilter(person, roleExcludeCodes) &&
			matchesCountryOfficeExcludeFilter(person, excludeCountryOfficeMembers),
	);

	// Manual picks bypass the role/status filters — an explicitly chosen person always shows up.
	const persons = manualUuids.length
		? allPersons
		: allPersons.filter((person) => matchesRoleFilter(person, roleFilterCodes) && matchesStatusFilter(person, statusFilter));
	const limitedPersons = !isInteractive && limit > 0 ? persons.slice(0, limit) : persons;

	if (limitedPersons.length === 0) {
		return null;
	}

	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	const volunteerDurationTranslations =
		showVolunteerDuration && translator
			? {
					startedToday: translator.t('person-grid.duration-started-today'),
					daySingular: translator.t('person-grid.duration-day-singular'),
					dayPlural: translator.t('person-grid.duration-day-plural'),
					monthSingular: translator.t('person-grid.duration-month-singular'),
					monthPlural: translator.t('person-grid.duration-month-plural'),
					yearSingular: translator.t('person-grid.duration-year-singular'),
					yearPlural: translator.t('person-grid.duration-year-plural'),
					monthAnniversarySingular: translator.t('person-grid.duration-month-anniversary-singular'),
					monthAnniversaryPlural: translator.t('person-grid.duration-month-anniversary-plural'),
					yearAnniversarySingular: translator.t('person-grid.duration-year-anniversary-singular'),
					yearAnniversaryPlural: translator.t('person-grid.duration-year-anniversary-plural'),
					since: translator.t('person-grid.duration-since'),
				}
			: undefined;

	const content =
		isInteractive && translator ? (
			<PersonGridInteractive
				persons={limitedPersons}
				lang={lang}
				region={region}
				centerLastRow={centerLastRow}
				smallCards={smallCards}
				linkToPersonPage={linkToPersonPage}
				volunteerDurationTranslations={volunteerDurationTranslations}
				roleLabels={roleLabels}
				showSearch={showSearch}
				showSort={showSort}
				showFilterPills={showFilterPills}
				limit={limit}
				translations={{
					searchPlaceholder: translator.t('person-grid.search-placeholder'),
					sortAriaLabel: translator.t('person-grid.sort-aria-label'),
					sortRandom: translator.t('person-grid.sort-random'),
					sortAlphabetical: translator.t('person-grid.sort-alphabetical'),
					sortStartDate: translator.t('person-grid.sort-start-date'),
					filterAllRoles: translator.t('person-grid.filter-all-roles'),
					filterAllStatuses: translator.t('person-grid.filter-all-statuses'),
					filterAllCountries: translator.t('person-grid.filter-all-countries'),
					filterMultipleSelected: translator.t('person-grid.filter-multiple-selected'),
					filterSelectAll: translator.t('person-grid.filter-select-all'),
					filterClearAll: translator.t('person-grid.filter-clear-all'),
					statusActive: translator.t('person-grid.status-active'),
					statusInactive: translator.t('person-grid.status-inactive'),
					noResults: translator.t('person-grid.no-results'),
				}}
			/>
		) : (
			<PersonCardGrid
				persons={limitedPersons}
				lang={lang}
				region={region}
				centerLastRow={centerLastRow}
				smallCards={smallCards}
				linkToPersonPage={linkToPersonPage}
				volunteerDurationTranslations={volunteerDurationTranslations}
				roleLabels={roleLabels}
			/>
		);

	return (
		<BlockWrapper
			{...storyblokEditable(blok as SbBlokData)}
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
