import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { ProgramsOverview } from '@/components/storyblok/program/programs-overview';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramsOverviewPage = async ({ overview, lang, region }: Props) => {
	const programsResult = await services.storyblok.getPrograms(lang);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const programIds = [...new Set(programs.map((program) => getProgramId(program.content)).filter(Boolean))];
	const statsResult = await services.read.program.getPublicProgramStatsByIds(programIds);
	const statsById = statsResult.success ? statsResult.data : {};
	const title = overview.content.title?.trim() ?? overview.name;

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			{title ? <h1 className="text-4xl font-bold xl:text-6xl">{title}</h1> : null}
			<ProgramsOverview programs={programs} statsById={statsById} lang={lang} region={region} />
		</div>
	);
};
