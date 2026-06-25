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
	const [displayCurrency, totalsResult] = await Promise.all([
		getWebsiteCurrencyFromCookie(),
		services.transparency.getTransparencyTotals(),
	]);
	const totalChf = totalsResult.success ? totalsResult.data.totalContributionsChf : 0;
	const { amount: totalAmount, currency } = await services.currencyDisplay.resolveFromChf(totalChf, displayCurrency);

	return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalAmount={totalAmount} currency={currency} />;
};
