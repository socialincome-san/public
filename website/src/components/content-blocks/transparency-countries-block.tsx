import { BlockWrapper } from '@/components/block-wrapper';
import { Card } from '@/components/card/card';
import {
	CountriesSectionClient,
	type CountriesSectionOtherCountry,
	type CountriesSectionSegment,
} from '@/components/transparency/countries-section-client';
import type { TransparencyCountries } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import {
	formatPercentageDisplay,
	TOP_CONTRIBUTING_COUNTRIES_LIMIT,
} from '@/lib/services/transparency/countries-distribution';
import {
	OTHER_COUNTRY_SEGMENT_CODE,
	type TransparencyFinancialPeriod,
} from '@/lib/services/transparency/transparency.types';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: TransparencyCountries;
	lang: WebsiteLanguage;
};

export const TransparencyCountriesBlock = async ({ blok, lang }: Props) => {
	const financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' };
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [dataResult, rates] = await Promise.all([
		services.transparency.getContributionsByCountryData(TOP_CONTRIBUTING_COUNTRIES_LIMIT, financialPeriod),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);

	if (!dataResult.success) {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common', 'countries'] });
	const locale = getSafeNumberFormatLocale(lang);
	const data = dataResult.data;
	const formatAmount = (amountChf: number): string => {
		const { amount, currency } = services.currencyDisplay.resolveFromChf(amountChf, displayCurrency, rates);

		return formatCurrencyLocale(amount, currency, locale, { maximumFractionDigits: 0 });
	};

	const otherCountriesLabel = translator.t('transparency-page.countries.other-countries');
	const formattedTotalAmount = formatAmount(data.totalContributionsChf);
	const formattedCountriesCount = formatNumberLocale(data.countriesCount, locale, { maximumFractionDigits: 0 });
	const segments: CountriesSectionSegment[] = data.segments.map((segment) => {
		const countryName =
			segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE
				? otherCountriesLabel
				: translator.t(segment.countryCode, { namespace: 'countries' });
		const formattedAmount = formatAmount(segment.totalChf);
		const formattedPercentage = formatPercentageDisplay(segment.percentageOfTotal, segment.totalChf);

		return {
			id: segment.countryCode,
			countryCode: segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE ? null : segment.countryCode,
			countryName,
			formattedAmount,
			formattedPercentage,
			unitCount: segment.unitCount,
			color: segment.color,
			rowAriaLabel: translator.t('transparency-page.countries.legend-row-aria', {
				context: {
					country: countryName,
					amount: formattedAmount,
					percentage: formattedPercentage,
				},
			}),
		};
	});
	const otherCountries: CountriesSectionOtherCountry[] = data.otherCountries.map((country) => ({
		countryCode: country.countryCode,
		countryName: translator.t(country.countryCode, { namespace: 'countries' }),
		formattedAmount: formatAmount(country.totalChf),
	}));

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<section>
				<Card variant="noPadding" className="overflow-hidden px-6 py-8 sm:px-10">
					<CountriesSectionClient
						sectionTitle={translator.t('transparency-page.inflows.title-name')}
						headlineTemplate={translator.t('transparency-page.countries.headline', {
							context: { count: data.countriesCount },
						})}
						headlineCountryTemplate={translator.t('transparency-page.countries.headline-country')}
						headlineOtherTemplate={translator.t('transparency-page.countries.headline-other')}
						otherCountriesLabel={otherCountriesLabel}
						emptyLabel={translator.t('transparency-page.countries.empty')}
						chartAriaLabel={translator.t('transparency-page.countries.chart-aria-label')}
						dialogTitle={translator.t('transparency-page.countries.other-countries-title')}
						formattedTotalAmount={formattedTotalAmount}
						formattedCountriesCount={formattedCountriesCount}
						segments={segments}
						otherCountries={otherCountries}
					/>
				</Card>
			</section>
		</BlockWrapper>
	);
};
