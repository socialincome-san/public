import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import {
	getProgramPortalSlug,
	getProgramStoryblokSlug,
	getProgramTitle,
} from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import { ProgramsOverviewFilters } from '@/components/storyblok/program/programs-overview-filters';
import { ProgramsOverviewSearch } from '@/components/storyblok/program/programs-overview-search';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicProgramFilterDataMap, PublicProgramStatsMap } from '@/lib/services/program/program.types';
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
		getProgramPortalSlug(program.content),
		getProgramStoryblokSlug(program),
		program.content.description,
	]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/);

	return searchTerms.every((term) => keywords.includes(term));
};

const programMatchesCountryQuery = (
	program: ProgramStory,
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	selectedCountryIsoCode: string | undefined,
) => {
	if (!selectedCountryIsoCode) {
		return true;
	}

	const portalSlug = getProgramPortalSlug(program.content);

	return Boolean(portalSlug && filterDataByPortalSlug[portalSlug]?.countryIsoCode === selectedCountryIsoCode);
};

const programMatchesFocusQuery = (
	program: ProgramStory,
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	selectedFocusId: string | undefined,
) => {
	if (!selectedFocusId) {
		return true;
	}

	const portalSlug = getProgramPortalSlug(program.content);

	return Boolean(portalSlug && filterDataByPortalSlug[portalSlug]?.focuses.some(({ id }) => id === selectedFocusId));
};

const toPortalSlugStatsMap = (
	programs: ProgramStory[],
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	statsByProgramId: PublicProgramStatsMap,
): PublicProgramStatsMap => {
	const statsByPortalSlug: PublicProgramStatsMap = {};

	programs.forEach((program) => {
		const portalSlug = getProgramPortalSlug(program.content);
		const programId = filterDataByPortalSlug[portalSlug]?.programId;
		const stats = programId ? statsByProgramId[programId] : undefined;

		if (stats) {
			statsByPortalSlug[portalSlug] = stats;
		}
	});

	return statsByPortalSlug;
};

const getCountryFilterOptions = (filterDataByPortalSlug: PublicProgramFilterDataMap): FilterOption[] => {
	const optionsByCountryIsoCode = new Map<string, FilterOption>();

	Object.values(filterDataByPortalSlug).forEach(({ countryIsoCode }) => {
		optionsByCountryIsoCode.set(countryIsoCode, {
			value: countryIsoCode,
			label: getCountryNameByCode(countryIsoCode),
		});
	});

	return [...optionsByCountryIsoCode.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

const getFocusTitleBySlug = (focuses: FocusStory[]) => {
	const focusTitleBySlug = new Map<string, string>();

	focuses.forEach((focus) => {
		const slug = focus.content.portalSlug?.trim();
		const title = focus.content.title?.trim();

		if (slug && title) {
			focusTitleBySlug.set(slug, title);
		}
	});

	return focusTitleBySlug;
};

const getFocusFilterOptions = (
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	focusTitleBySlug: Map<string, string>,
): FilterOption[] => {
	const optionsByFocusId = new Map<string, FilterOption>();

	Object.values(filterDataByPortalSlug).forEach(({ focuses }) => {
		focuses.forEach((focus) => {
			optionsByFocusId.set(focus.id, {
				value: focus.id,
				label: focusTitleBySlug.get(focus.slug) ?? focus.slug,
			});
		});
	});

	return [...optionsByFocusId.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

export const ProgramsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const [programsResult, storyblokFocusesResult] = await Promise.all([
		services.storyblok.getPrograms(lang),
		services.storyblok.getFocuses(lang),
	]);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const storyblokFocuses = (storyblokFocusesResult.success ? storyblokFocusesResult.data : []) as FocusStory[];
	const programPortalSlugs = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const focusTitleBySlug = getFocusTitleBySlug(storyblokFocuses);
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const filterDataResult = await services.read.program.getPublicProgramFilterDataByPortalSlugs(programPortalSlugs);
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};
	const programIds = [...new Set(Object.values(filterDataByPortalSlug).map(({ programId }) => programId))];
	const [statsResult, breadcrumbLinks, translator] = await Promise.all([
		services.read.program.getPublicProgramStatsByIds(programIds),
		buildBreadcrumbLinks({
			fullSlug: overview.full_slug,
			currentLabel: title,
			lang,
			region,
		}),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);
	const statsByPortalSlug = toPortalSlugStatsMap(
		programs,
		filterDataByPortalSlug,
		statsResult.success ? statsResult.data : {},
	);
	const countryOptions = getCountryFilterOptions(filterDataByPortalSlug);
	const focusFilterOptions = getFocusFilterOptions(filterDataByPortalSlug, focusTitleBySlug);
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const focusQuery = getFocusQuery(searchParams);
	const selectedCountryIsoCode = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const selectedFocusId = focusFilterOptions.some((option) => option.value === focusQuery) ? focusQuery : undefined;
	const countryFilteredPrograms = programs.filter((program) =>
		programMatchesCountryQuery(program, filterDataByPortalSlug, selectedCountryIsoCode),
	);
	const focusFilteredPrograms = countryFilteredPrograms.filter((program) =>
		programMatchesFocusQuery(program, filterDataByPortalSlug, selectedFocusId),
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
					selectedCountryIsoCode={selectedCountryIsoCode}
					focusOptions={focusFilterOptions}
					selectedFocusId={selectedFocusId}
				/>
				<ProgramsOverviewSearch
					defaultValue={searchQuery}
					label={translator.t('programs-page.search-label')}
					placeholder={translator.t('programs-page.search-placeholder')}
				/>
			</div>
			<ProgramsOverview programs={filteredPrograms} statsByPortalSlug={statsByPortalSlug} lang={lang} region={region} />
		</div>
	);
};
