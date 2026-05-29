import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId, getProgramSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import { ProgramsOverviewSearch } from '@/components/storyblok/program/programs-overview-search';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

const getSearchQuery = (searchParams?: AnySearchParams) => {
	const search = searchParams?.search;
	const value = Array.isArray(search) ? search.at(0) : search;

	return typeof value === 'string' ? value.trim() : '';
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

export const ProgramsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const programsResult = await services.storyblok.getPrograms(lang);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const title = overview.content.title?.trim() ?? overview.name;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const searchQuery = getSearchQuery(searchParams);
	const filteredPrograms = searchQuery
		? programs.filter((program) => programMatchesSearchQuery(program, searchQuery))
		: programs;

	console.warn('programs', { programs, statsById });

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			{title ? <h1 className="text-4xl font-bold xl:text-6xl">{title}</h1> : null}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="min-h-10 flex-1" aria-hidden />
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
