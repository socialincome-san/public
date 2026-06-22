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

const pickRandomPrograms = (programs: ProgramStory[], count: number) => {
	const shuffled = [...programs];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
};

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

	const relatedPrograms = pickRandomPrograms(otherPrograms, RELATED_PROGRAMS_COUNT);

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

	return (
		<ProgramGridBlock
			blok={blok}
			lang={lang}
			region={region}
		/>
	);
};
