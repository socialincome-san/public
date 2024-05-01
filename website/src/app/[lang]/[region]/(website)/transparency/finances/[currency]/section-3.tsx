import { roundAmount } from '@/app/[lang]/[region]/(website)/transparency/finances/[currency]/section-1';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { SectionProps } from './page';
import { CountryCard, CountryCardList } from './section-3-cards';

export async function Section3({ params, contributionStats, expenseStats }: SectionProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['countries', 'website-finances'],
	});
	const totalContributionsByCountry = contributionStats.totalContributionsByCountry as {
		country: string;
		amount: number;
		usersCount: number;
	}[];

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
										value: roundAmount(entry.amount),
										currency: params.currency,
										contributorsCount: entry.usersCount,
									},
								}),
							}}
							expenseStats={expenseStats}
						/>
					))}
			</CountryCardList>
		</div>
	);
}
