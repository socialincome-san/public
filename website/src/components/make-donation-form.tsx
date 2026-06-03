'use client';

import { EmbeddedDonationForm } from '@/components/donation-wizard/embedded-donation-form';
import { CampaignCheckoutForm, type CampaignCheckoutTranslations } from '@/components/donation/campaign-checkout-form';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	lang: WebsiteLanguage;
	region?: WebsiteRegion;
	campaignId?: string;
	daysLeft?: number;
	daysLeftLabel?: string;
	campaignTranslations?: CampaignCheckoutTranslations;
};

export const MakeDonationForm = ({ lang, region, campaignId, daysLeft, daysLeftLabel, campaignTranslations }: Props) => {
	if (campaignId && region && campaignTranslations && daysLeft !== undefined && daysLeftLabel) {
		return (
			<CampaignCheckoutForm
				lang={lang}
				region={region}
				campaignId={campaignId}
				daysLeft={daysLeft}
				daysLeftLabel={daysLeftLabel}
				translations={campaignTranslations}
			/>
		);
	}

	return <EmbeddedDonationForm showTitle />;
};
