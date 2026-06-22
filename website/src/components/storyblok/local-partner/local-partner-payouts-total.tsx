import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { LocalPartnerStory } from './local-partner.types';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnerPayoutsTotal = async ({ localPartner, lang, region }: Props) => {
	const blok = localPartner.content.payouts?.[0];
	const localPartnerSlug = localPartner.content.portalSlug?.trim();
	if (!localPartnerSlug) {
		return <StoryblokPayoutsTotal blok={blok} totalChf={0} lang={lang} region={region} />;
	}

	const totalsResult = await services.read.payout.getPayoutTotalsForLocalPartnerSlug(localPartnerSlug);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;

	return <StoryblokPayoutsTotal blok={blok} totalChf={totalChf} lang={lang} region={region} />;
};
