import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
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
	if (!blok) {
		return null;
	}

	const localPartnerSlug = localPartner.content.portalSlug?.trim();
	if (!localPartnerSlug) {
		return null;
	}

	const totalsResult = await services.read.payout.getPayoutTotalsForLocalPartnerSlug(localPartnerSlug);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;

	if (totalChf === 0) {
		return null;
	}

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalChf={totalChf} />;
};
