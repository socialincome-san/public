import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { CountryStory } from './country.types';
import { getCountryIsoCode } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CountryPayoutsTotal = async ({ country, lang, region }: Props) => {
	const blok = country.content.payouts?.[0];
	const isoCode = getCountryIsoCode(country.content);
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [totalsResult, rates] = await Promise.all([
		services.read.payout.getPayoutTotalsForCountry(isoCode),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;
	const { amount: totalAmount, currency } = await services.currencyDisplay.resolveFromChf(
		totalChf,
		displayCurrency,
		rates,
	);

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
