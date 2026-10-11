import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPublicCountryPayoutTotalsAction } from '@/modules/payouts/payout.actions';
import type { CountryStory } from './country.types';
import { getCountryIsoCode } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CountryPayoutsTotal = async ({ country, lang, currency }: Props) => {
	const blok = country.content.payouts?.[0];
	const isoCode = getCountryIsoCode(country.content);
	const totalsResult = await getPublicCountryPayoutTotalsAction(isoCode);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;

	return <StoryblokPayoutsTotal blok={blok} totalChf={totalChf} lang={lang} currency={currency} />;
};
