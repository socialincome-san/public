import { getProgramGridPrograms } from '@/components/content-blocks/program-grid-view';
import { StoryblokProgramGrid } from '@/components/storyblok/shared/storyblok-program-grid';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnerPrograms = async ({ localPartner, lang, currency }: Props) => {
	const blok = localPartner.content.programs?.[0];
	if (!blok) {
		return null;
	}

	const { programs, statsByPortalSlug } = await getProgramGridPrograms(blok, lang);

	return (
		<StoryblokProgramGrid
			blok={blok}
			programs={programs}
			statsByPortalSlug={statsByPortalSlug}
			lang={lang}
			currency={currency}
		/>
	);
};
