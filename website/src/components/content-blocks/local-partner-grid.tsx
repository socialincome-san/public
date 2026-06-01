import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { LocalPartnersOverview } from '@/components/storyblok/local-partner/local-partners-overview';
import type { LocalPartnerGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: LocalPartnerGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerGridBlock = async ({ blok, lang, region }: Props) => {
	const localPartnersResult = await services.storyblok.getLocalPartners(lang);
	const allLocalPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const localPartners = blok.showAllLocalPartners
		? allLocalPartners
		: resolveSelectedStories(blok.localPartners, allLocalPartners);

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<LocalPartnersOverview localPartners={localPartners} lang={lang} region={region} />
		</BlockWrapper>
	);
};
