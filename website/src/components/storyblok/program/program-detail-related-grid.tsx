import { ProgramGridBlock } from '@/components/content-blocks/program-grid';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import type { Button, ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type Props = {
	currentProgramFullSlug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const RELATED_PROGRAMS_COUNT = 3;

export const ProgramDetailRelatedGrid = async ({ currentProgramFullSlug, lang, region }: Props) => {
	const [programsResult, translator] = await Promise.all([
		services.storyblok.getPrograms(lang),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);
	const allPrograms = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const otherPrograms = allPrograms.filter((program) => program.full_slug !== currentProgramFullSlug);

	if (otherPrograms.length === 0) {
		return null;
	}

	const relatedPrograms = [...otherPrograms]
		.sort((programA, programB) =>
			(programB.first_published_at ?? programB.published_at ?? programB.created_at).localeCompare(
				programA.first_published_at ?? programA.published_at ?? programA.created_at,
			),
		)
		.slice(0, RELATED_PROGRAMS_COUNT);

	const button: Button = {
		component: 'button',
		_uid: 'program-detail-related-grid-button',
		link: {
			fieldtype: 'multilink',
			id: '',
			url: '',
			cached_url: getProgramsOverviewStoryPath(),
			linktype: 'story',
		},
	};

	const blok: ProgramGrid = {
		component: 'programGrid',
		_uid: 'program-detail-related-grid',
		heading: translator.t('programs-page.related-heading'),
		description: translator.t('programs-page.related-description'),
		showAllPrograms: false,
		programs: relatedPrograms,
		button: [button],
	};

	return <ProgramGridBlock blok={blok} lang={lang} region={region} />;
};
