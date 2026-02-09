import { Card } from '@/components/card';
import { CountryFlag } from '@/components/country-flag';
import { Progress } from '@/components/progress';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributionsByCountry } from '@/lib/services/transparency/transparency.types';

type CountriesSectionProps = {
	countries: ContributionsByCountry[];
	exchangeRate: number;
	currency: WebsiteCurrency;
	lang: WebsiteLanguage;
};

function formatCurrency(amount: number, currency: string, lang: WebsiteLanguage): string {
	return new Intl.NumberFormat(lang, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatNumber(value: number, lang: WebsiteLanguage): string {
	return new Intl.NumberFormat(lang).format(value);
}

export function CountriesSection({ countries, exchangeRate, currency, lang }: CountriesSectionProps) {
	return (
		<section>
			<h2 className="mb-6 text-2xl font-semibold">Top Contributing Countries</h2>
			<Card>
				<div className="space-y-6">
					{countries.map((country) => {
						const totalConverted = country.totalChf * exchangeRate;
						return (
							<div key={country.countryCode} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<CountryFlag country={country.countryCode} size="sm" />
										<span className="font-medium">{country.country}</span>
									</div>
									<div className="text-right">
										<span className="font-semibold">{formatCurrency(totalConverted, currency, lang)}</span>
										<span className="text-muted-foreground ml-2 text-sm">
											({formatNumber(country.contributorCount, lang)} contributors)
										</span>
									</div>
								</div>
								<Progress value={country.percentageOfTotal} />
							</div>
						);
					})}
				</div>
			</Card>
		</section>
	);
}
