import { roundAmount } from '@/app/[lang]/[region]/(website)/transparency/finances/[currency]/section-1';
import { toCurrencyLocale } from '@/i18n';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { InfoCard } from './info-card';
import { SectionProps } from './page';

export async function Section2({ params, contributionStats, expensesStats, paymentStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });
	const expensesProject = _.sum(Object.values(expensesStats.totalExpensesByType));
	const currencyLocale = toCurrencyLocale(params.lang, params.region, params.currency, { maximumFractionDigits: 0 });

	return (
		<div>
			<Typography weight="bold" size="3xl" className="mb-8">
				{translator.t('section-2.title')}
			</Typography>
			<InfoCard
				sectionTitle={translator.t('section-2.donations')}
				title={translator.t('amount', {
					context: { value: roundAmount(contributionStats.totalContributionsAmount), ...currencyLocale },
				})}
				text={translator.t('section-2.amount-since-march-2020')}
				firstIcon={<HeartIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-2.contributions-from', {
									context: {
										value: roundAmount(contributionStats.totalIndividualContributionsAmount),
										...currencyLocale,
									},
								})}
							</Typography>
							<Badge className="mx-1">
								{translator.t('section-2.individuals', {
									context: { count: contributionStats.totalIndividualContributorsCount },
								})}
							</Badge>
						</div>
						<Typography>
							{translator.t('section-2.past-payouts', {
								context: {
									value: roundAmount(paymentStats.totalPaymentsAmount),
									...currencyLocale,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-2.payments-future', {
								context: {
									value: roundAmount(
										contributionStats.totalIndividualContributionsAmount - paymentStats.totalPaymentsAmount,
									),
									...currencyLocale,
								},
							})}
						</Typography>
					</div>
				}
				secondIcon={<HeartIcon className="h-8 w-8" />}
				secondContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-2.contributions-from', {
									context: {
										value: roundAmount(contributionStats.totalInstitutionalContributionsAmount),
										...currencyLocale,
									},
								})}
							</Typography>
							<Badge className="mx-1">
								{translator.t('section-2.institutions', {
									context: { count: contributionStats.totalInstitutionalContributorsCount },
								})}
							</Badge>
						</div>
						<Typography>
							{translator.t('section-2.past-costs', {
								context: {
									value: roundAmount(expensesProject),
									...currencyLocale,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-2.future-costs', {
								context: {
									value: roundAmount(contributionStats.totalInstitutionalContributionsAmount - expensesProject),
									...currencyLocale,
								},
							})}
						</Typography>
					</div>
				}
			/>
		</div>
	);
}
