import { LocalPartnerGridBlock } from '@/components/content-blocks/local-partner-grid';
import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import type { LocalPartner } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnersAction } from '@/modules/storyblok-content/storyblok-content.actions';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnerPartners = async ({ localPartner, lang, currency }: Props) => {
	const gridBlok = localPartner.content.localPartnerGrid?.[0];
	if (gridBlok) {
		return <LocalPartnerGridBlock blok={gridBlok} lang={lang} currency={currency} />;
	}

	const partners = localPartner.content.partners ?? [];
	if (partners.length === 0) {
		return null;
	}

	const localPartnersResult = await getLocalPartnersAction(lang);
	const allLocalPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const resolvedPartners = resolveSelectedStories<LocalPartner>(partners, allLocalPartners);

	return <LocalPartnersTeaserRowContent localPartners={resolvedPartners} lang={lang} currency={currency} />;
};
