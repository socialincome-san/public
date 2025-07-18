import { roundAmount } from '@/app/[lang]/[region]/(website)/transparency/finances/[currency]/section-1';
import { toCurrencyLocale } from '@/lib/i18n/utils';
import { CountryCode } from '@socialincome/shared/src/types/country';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { SectionProps } from './page';
import { CountryCard, CountryCardList } from './section-3-cards';

export async function Section3({ params, contributionStats }: SectionProps) {
	const { lang, region, currency } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['countries', 'website-finances'] });
	const totalContributionsByCountry = contributionStats.totalContributionsByCountry as {
		country: CountryCode;
		amount: number;
		usersCount: number;
	}[];
	const currencyLocale = toCurrencyLocale(lang, region, currency, { maximumFractionDigits: 0 });

	return (
		<div>
			<Typography weight="bold" size="3xl">
				{translator.t('section-3.title')}
			</Typography>
			<Typography size="lg" className="mb-8">
				{translator.t('section-3.subtitle', { context: { value: totalContributionsByCountry.length } })}
			</Typography>
			<CountryCardList buttonText={translator.t('section-3.all-countries')}>
				{totalContributionsByCountry
					.sort((a, b) => b.amount - a.amount)
					.map((entry, index) => (
						<CountryCard
							key={index}
							country={entry.country}
							translations={{
								country: translator.t(entry.country),
								total: translator.t('section-3.country-amount', {
									context: {
										contributorsCount: entry.usersCount,
										value: roundAmount(entry.amount),
										...currencyLocale,
									},
								}),
							}}
						/>
					))}
			</CountryCardList>
		</div>
	);
}
