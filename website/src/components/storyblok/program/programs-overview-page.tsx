import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId, getProgramSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import { ProgramsOverviewFilters } from '@/components/storyblok/program/programs-overview-filters';
import { ProgramsOverviewSearch } from '@/components/storyblok/program/programs-overview-search';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramFocusMap, PublicProgramStatsMap } from '@/lib/services/program/program.types';
import { services } from '@/lib/services/services';
import { getCountryNameByCode } from '@/lib/types/country';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

const COUNTRY_QUERY_KEY = 'country';
const FOCUS_QUERY_KEY = 'focus';

type FilterOption = {
	value: string;
	label: string;
};

const getQueryValue = (searchParams: AnySearchParams | undefined, key: string) => {
	const value = searchParams?.[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

const getSearchQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, 'search');
};

const getCountryQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, COUNTRY_QUERY_KEY);
};

const getFocusQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, FOCUS_QUERY_KEY);
};

const normalizeSearchValue = (value: string) => value.toLowerCase();

const programMatchesSearchQuery = (program: ProgramStory, searchQuery: string) => {
	const keywords = [
		getProgramTitle(program.content),
		getProgramId(program.content),
		getProgramSlug(program),
		program.content.description,
	]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/);

	return searchTerms.every((term) => keywords.includes(term));
};

const programMatchesCountryQuery = (
	program: ProgramStory,
	statsById: PublicProgramStatsMap,
	selectedCountry: string | undefined,
) => {
	if (!selectedCountry) {
		return true;
	}

	const programId = getProgramId(program.content);

	return Boolean(programId && statsById[programId]?.countryIsoCode === selectedCountry);
};

const programMatchesFocusQuery = (
	program: ProgramStory,
	focusMap: PublicProgramFocusMap,
	selectedFocus: string | undefined,
) => {
	if (!selectedFocus) {
		return true;
	}

	const programId = getProgramId(program.content);

	return Boolean(programId && focusMap[programId]?.some((focus) => focus.id === selectedFocus));
};

const getCountryFilterOptions = (programs: ProgramStory[], statsById: PublicProgramStatsMap): FilterOption[] => {
	const optionsByCountry = new Map<string, FilterOption>();

	programs.forEach((program) => {
		const programId = getProgramId(program.content);
		const countryIsoCode = programId ? statsById[programId]?.countryIsoCode : undefined;

		if (countryIsoCode) {
			optionsByCountry.set(countryIsoCode, {
				value: countryIsoCode,
				label: getCountryNameByCode(countryIsoCode),
			});
		}
	});

	return [...optionsByCountry.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

const getFocusTitleById = (focusOptions: { id: string; name: string }[]) => {
	const focusTitleById = new Map<string, string>();

	focusOptions.forEach(({ id, name }) => {
		focusTitleById.set(id, name);
	});

	return focusTitleById;
};

const getFocusFilterOptions = (
	programs: ProgramStory[],
	focusMap: PublicProgramFocusMap,
	focusTitleById: Map<string, string>,
): FilterOption[] => {
	const optionsByFocus = new Map<string, FilterOption>();

	programs.forEach((program) => {
		const programId = getProgramId(program.content);
		const focuses = programId ? focusMap[programId] : undefined;

		focuses?.forEach((focus) => {
			const focusTitle = focusTitleById.get(focus.id);

			if (focusTitle) {
				optionsByFocus.set(focus.id, {
					value: focus.id,
					label: focusTitle,
				});
			}
		});
	});

	return [...optionsByFocus.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

export const ProgramsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const [programsResult, focusOptionsResult] = await Promise.all([
		services.storyblok.getPrograms(lang),
		services.read.focus.getOptions(),
	]);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const dbFocusOptions = focusOptionsResult.success ? focusOptionsResult.data : [];
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const [statsResult, focusMapResult] = await Promise.all([
		services.read.program.getPublicProgramStatsByIds(programIds),
		services.read.program.getPublicProgramFocusMapByIds(programIds),
	]);
	const statsById = statsResult.success ? statsResult.data : {};
	const focusMap = focusMapResult.success ? focusMapResult.data : {};
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		region,
	});
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const focusQuery = getFocusQuery(searchParams);
	const countryOptions = getCountryFilterOptions(programs, statsById);
	const focusFilterOptions = getFocusFilterOptions(programs, focusMap, getFocusTitleById(dbFocusOptions));
	const selectedCountry = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const selectedFocus = focusFilterOptions.some((option) => option.value === focusQuery) ? focusQuery : undefined;
	const countryFilteredPrograms = programs.filter((program) =>
		programMatchesCountryQuery(program, statsById, selectedCountry),
	);
	const focusFilteredPrograms = countryFilteredPrograms.filter((program) =>
		programMatchesFocusQuery(program, focusMap, selectedFocus),
	);
	const filteredPrograms = searchQuery
		? focusFilteredPrograms.filter((program) => programMatchesSearchQuery(program, searchQuery))
		: focusFilteredPrograms;

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<CmsHeader title={title} text={text} />
			<div className="flex flex-wrap items-center justify-between gap-4">
				<ProgramsOverviewFilters
					allCountriesLabel={translator.t('programs-page.all-countries', { context: { count: countryOptions.length } })}
					allFocusesLabel={translator.t('programs-page.all-focuses', { context: { count: focusFilterOptions.length } })}
					countryOptions={countryOptions}
					selectedCountry={selectedCountry}
					focusOptions={focusFilterOptions}
					selectedFocus={selectedFocus}
				/>
				<ProgramsOverviewSearch
					defaultValue={searchQuery}
					label={translator.t('programs-page.search-label')}
					placeholder={translator.t('programs-page.search-placeholder')}
				/>
			</div>
			<ProgramsOverview programs={filteredPrograms} statsById={statsById} lang={lang} region={region} />
		</div>
	);
};
