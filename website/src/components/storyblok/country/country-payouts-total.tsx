import { StoryblokPayoutsTotal } from '@/components/storyblok/shared/storyblok-payouts-total';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
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
	const totalsResult = await services.read.payout.getPayoutTotalsForCountry(isoCode);
	const totalChf = totalsResult.success ? totalsResult.data.totalPayoutsChf : 0;

	return <StoryblokPayoutsTotal blok={blok} totalChf={totalChf} lang={lang} region={region} />;
};
