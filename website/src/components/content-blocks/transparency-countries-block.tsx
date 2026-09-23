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
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getContributionsByCountryDataAction } from '@/modules/transparency/transparency.actions';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: TransparencyCountries;
	lang: WebsiteLanguage;
};

export const TransparencyCountriesBlock = async ({ blok, lang }: Props) => {
	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const dataResult = await getContributionsByCountryDataAction({
		limit: 15,
		financialPeriod: { kind: 'all-time' },
	});

	if (!dataResult.success) {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common', 'countries'] });
	const locale = getSafeNumberFormatLocale(lang);
	const data = dataResult.data;
	const chfAmounts = [
		data.totalContributionsChf,
		...data.segments.map(({ totalChf }) => totalChf),
		...data.otherCountries.map(({ totalChf }) => totalChf),
	];
	const displayResult = await resolveChfAmountsAction({ amounts: chfAmounts, displayCurrency });
	if (!displayResult.success) {
		return null;
	}
	const formattedAmounts = displayResult.data.map(({ amount, currency }) =>
		formatCurrencyLocale(amount, currency, locale, { maximumFractionDigits: 0 }),
	);

	const otherCountriesLabel = translator.t('transparency-page.countries.other-countries');
	const formattedTotalAmount = formattedAmounts[0] ?? formatCurrencyLocale(0, 'CHF', locale);
	const formattedCountriesCount = formatNumberLocale(data.countriesCount, locale, { maximumFractionDigits: 0 });
	const segments: CountriesSectionSegment[] = data.segments.map((segment, index) => {
		const countryName =
			segment.countryCode === 'OTHER' ? otherCountriesLabel : translator.t(segment.countryCode, { namespace: 'countries' });
		const formattedAmount = formattedAmounts[index + 1] ?? formatCurrencyLocale(segment.totalChf, 'CHF', locale);
		const formattedPercentage = formatPercentageDisplay(segment.percentageOfTotal, segment.totalChf);

		return {
			id: segment.countryCode,
			countryCode: segment.countryCode === 'OTHER' ? null : segment.countryCode,
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
	const otherCountries: CountriesSectionOtherCountry[] = data.otherCountries.map((country, index) => ({
		countryCode: country.countryCode,
		countryName: translator.t(country.countryCode, { namespace: 'countries' }),
		formattedAmount:
			formattedAmounts[data.segments.length + index + 1] ?? formatCurrencyLocale(country.totalChf, 'CHF', locale),
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

const formatPercentageDisplay = (percentageOfTotal: number, amount: number): string => {
	if (amount > 0 && Math.round(percentageOfTotal) === 0) {
		return '<1%';
	}

	return `${Math.round(percentageOfTotal)}%`;
};
