import { Card } from '@/components/card';
import { CountryFlag } from '@/components/country-flag';
import { Progress } from '@/components/progress';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import type { ExchangeRates } from '@/lib/services/exchange-rate/exchange-rate.types';
import { services } from '@/lib/services/services';
import type { ContributionsByCountry } from '@/lib/services/transparency/transparency.types';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

type CountriesSectionProps = {
	countries: ContributionsByCountry[];
	lang: WebsiteLanguage;
	displayCurrency: WebsiteCurrency;
	rates?: ExchangeRates;
};

const formatNumber = (value: number, lang: WebsiteLanguage): string => {
	return new Intl.NumberFormat(lang).format(value);
};

export const CountriesSection = ({ countries, lang, displayCurrency, rates }: CountriesSectionProps) => {
	const locale = getSafeNumberFormatLocale(lang);

	const countryDisplays = countries.map((country) => {
		const { amount, currency } = services.currencyDisplay.resolveFromChf(country.totalChf, displayCurrency, rates);

		return { country, amount, currency };
	});

	return (
		<section>
			<h2 className="mb-6 text-2xl font-bold">Top Contributing Countries</h2>
			<Card>
				<div className="space-y-6">
					{countryDisplays.map(({ country, amount, currency }) => (
						<div key={country.countryCode} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<CountryFlag country={country.countryCode} size="sm" />
									<span className="font-medium">{country.country}</span>
								</div>
								<div className="flex flex-col items-end md:flex-row md:items-baseline">
									<span className="font-bold">
										{formatCurrencyLocale(amount, currency, locale, { maximumFractionDigits: 0 })}
									</span>
									<span className="text-muted-foreground text-sm md:ml-2">
										({formatNumber(country.contributorCount, lang)} contributors)
									</span>
								</div>
							</div>
							<Progress value={country.percentageOfTotal} />
						</div>
					))}
				</div>
			</Card>
		</section>
	);
};
