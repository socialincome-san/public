import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId, getProgramSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import { ProgramsOverviewFilters } from '@/components/storyblok/program/programs-overview-filters';
import { ProgramsOverviewSearch } from '@/components/storyblok/program/programs-overview-search';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramStatsMap } from '@/lib/services/program/program.types';
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

type CountryFilterOption = {
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

const getCountryFilterOptions = (programs: ProgramStory[], statsById: PublicProgramStatsMap): CountryFilterOption[] => {
	const optionsByCountry = new Map<string, CountryFilterOption>();

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

export const ProgramsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const programsResult = await services.storyblok.getPrograms(lang);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const countryOptions = getCountryFilterOptions(programs, statsById);
	const selectedCountry = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const countryFilteredPrograms = programs.filter((program) =>
		programMatchesCountryQuery(program, statsById, selectedCountry),
	);
	const filteredPrograms = searchQuery
		? countryFilteredPrograms.filter((program) => programMatchesSearchQuery(program, searchQuery))
		: countryFilteredPrograms;

	console.warn('programs', { programs, statsById });

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<div className="flex flex-col gap-4">
				{title ? <h1 className="font-sans text-5xl font-normal text-cyan-900">{title}</h1> : null}
				{text ? <p className="text-foreground font-sans text-lg font-normal not-italic">{text}</p> : null}
			</div>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<ProgramsOverviewFilters countryOptions={countryOptions} selectedCountry={selectedCountry} />
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
