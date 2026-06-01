import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import type { LocalPartner } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerPartners = async ({ localPartner, lang, region }: Props) => {
	const partners = localPartner.content.partners ?? [];
	if (partners.length === 0) {
		return null;
	}

	const localPartnersResult = await services.storyblok.getLocalPartners(lang);
	const allLocalPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const resolvedPartners = resolveSelectedStories<LocalPartner>(partners, allLocalPartners);

	return <LocalPartnersTeaserRowContent localPartners={resolvedPartners} lang={lang} region={region} />;
};
