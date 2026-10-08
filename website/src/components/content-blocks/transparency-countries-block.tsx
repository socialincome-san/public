import {
	CountriesSectionClient,
	type CountriesSectionOtherCountry,
	type CountriesSectionSegment,
} from '@/components/transparency/countries-section-client';
import type { TransparencyCountries } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getContributionsByCountryDataAction } from '@/modules/transparency/transparency.actions';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

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

	const [t, tCountries] = await Promise.all([getTranslations('website-common'), getTranslations('countries')]);
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

	const otherCountriesLabel = t('transparency-page.countries.other-countries');
	const formattedTotalAmount = formattedAmounts[0] ?? formatCurrencyLocale(0, 'CHF', locale);
	const formattedCountriesCount = formatNumberLocale(data.countriesCount, locale, { maximumFractionDigits: 0 });
	const segments: CountriesSectionSegment[] = data.segments.map((segment, index) => {
		const countryName = segment.countryCode === 'OTHER' ? otherCountriesLabel : tCountries(segment.countryCode);
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
			rowAriaLabel: t('transparency-page.countries.legend-row-aria', {
				country: countryName,
				amount: formattedAmount,
				percentage: formattedPercentage,
			}),
		};
	});
	const otherCountries: CountriesSectionOtherCountry[] = data.otherCountries.map((country, index) => ({
		countryCode: country.countryCode,
		countryName: tCountries(country.countryCode),
		formattedAmount:
			formattedAmounts[data.segments.length + index + 1] ?? formatCurrencyLocale(country.totalChf, 'CHF', locale),
	}));

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<section>
				<Card>
					<CountriesSectionClient
						sectionTitle={t('transparency-page.inflows.title-name')}
						headlineTemplate={t('transparency-page.countries.headline', {
							// Only the plural form is resolved here; the client fills in the placeholders.
							count: data.countriesCount,
							amount: '{amount}',
							countriesCount: '{countriesCount}',
						})}
						headlineCountryTemplate={t('transparency-page.countries.headline-country', {
							amount: '{amount}',
							country: '{country}',
						})}
						headlineOtherTemplate={t('transparency-page.countries.headline-other', { amount: '{amount}' })}
						otherCountriesLabel={otherCountriesLabel}
						emptyLabel={t('transparency-page.countries.empty')}
						chartAriaLabel={t('transparency-page.countries.chart-aria-label')}
						dialogTitle={t('transparency-page.countries.other-countries-title')}
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
