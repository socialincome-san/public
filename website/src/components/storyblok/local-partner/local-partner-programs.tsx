import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerPrograms = async ({ localPartner, lang, region }: Props) => {
	const blok = localPartner.content.programs?.[0];
	if (!blok) {
		return null;
	}

	const programsResult = await services.storyblok.getPrograms(lang);
	const allPrograms = programsResult.success ? programsResult.data : [];
	const programs = blok.showAllPrograms ? allPrograms : resolveSelectedStories(blok.programs, allPrograms);

	return <StoryblokProgramGrid blok={blok} programs={programs} lang={lang} region={region} />;
};
