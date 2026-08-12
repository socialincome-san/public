import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import type { LocalPartner } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';

type Props = {
	localPartner: LocalPartnerStory;
};

export const LocalPartnerPartners = async ({ localPartner }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const partners = localPartner.content.partners ?? [];
	if (partners.length === 0) {
		return null;
	}

	const localPartnersResult = await services.storyblok.getLocalPartners(lang);
	const allLocalPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const resolvedPartners = resolveSelectedStories<LocalPartner>(partners, allLocalPartners);

	return <LocalPartnersTeaserRowContent localPartners={resolvedPartners} />;
};
