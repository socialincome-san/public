import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const DonationsTotalBlockServer = async ({ blok, lang, region }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [totalsResult, rates] = await Promise.all([
		services.transparency.getTransparencyTotals(),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);
	const totalChf = totalsResult.success ? totalsResult.data.totalContributionsChf : 0;
	const { amount: totalAmount, currency } = services.currencyDisplay.resolveFromChf(totalChf, displayCurrency, rates);

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalAmount={totalAmount} currency={currency} />;
};
