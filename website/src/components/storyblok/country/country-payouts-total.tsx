import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getPublicCountryPayoutTotalsAction } from '@/modules/payouts/payout.actions';
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
	const totalsResult = await getPublicCountryPayoutTotalsAction(isoCode);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;
	const displayResult = await resolveChfAmountsAction({ amounts: [totalChf], displayCurrency });
	const displayAmount = displayResult.success ? displayResult.data[0] : undefined;
	const { amount: totalAmount, currency } = displayAmount ?? { amount: totalChf, currency: 'CHF' as const };

	return <StoryblokPayoutsTotal blok={blok} totalAmount={totalAmount} currency={currency} lang={lang} region={region} />;
};
