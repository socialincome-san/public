import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { getLocalPartnerId } from '@/components/storyblok/local-partner/local-partner.utils';
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
	const localPartnerIds = [
		...new Set(localPartners.map((localPartner) => getLocalPartnerId(localPartner.content)).filter(Boolean)),
	];
	const statsResult = await services.read.localPartner.getPublicLocalPartnerStatsByIds(localPartnerIds);
	const statsById = statsResult.success ? statsResult.data : {};

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<LocalPartnersOverview localPartners={localPartners} statsById={statsById} lang={lang} region={region} />
		</BlockWrapper>
	);
};
