import { Card } from '@/components/card';
import { CountryFlag } from '@/components/country-flag';
import { Progress } from '@/components/progress';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributionsByCountry } from '@/lib/services/transparency/transparency.types';

type CountriesSectionProps = {
	countries: ContributionsByCountry[];
	lang: WebsiteLanguage;
};

const formatChf = (value: number) => {
	const number = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(value);

	return `CHF ${number}`;
};

const formatNumber = (value: number, lang: WebsiteLanguage): string => {
	return new Intl.NumberFormat(lang).format(value);
};

export const CountriesSection = ({ countries, lang }: CountriesSectionProps) => {
	return (
		<section>
			<h2 className="mb-6 text-2xl font-bold">Top Contributing Countries</h2>
			<Card>
				<div className="space-y-6">
					{countries.map((country) => {
						const totalConverted = country.totalChf;

						return (
							<div key={country.countryCode} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<CountryFlag country={country.countryCode} size="sm" />
										<span className="font-medium">{country.country}</span>
									</div>
									<div className="text-right">
										<span className="font-bold">{formatChf(totalConverted)}</span>
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
};
