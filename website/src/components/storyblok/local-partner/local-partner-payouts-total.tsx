import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
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
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [totalsResult, rates] = await Promise.all([
		localPartnerSlug ? services.read.payout.getPayoutTotalsForLocalPartnerSlug(localPartnerSlug) : Promise.resolve(null),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);

	const totalChf = localPartnerSlug && totalsResult?.success ? totalsResult.data.totalPayoutsChf : 0;
	const { amount: totalAmount, currency } = services.currencyDisplay.resolveFromChf(totalChf, displayCurrency, rates);

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
