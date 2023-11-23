import { HeartIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { InfoCard } from './info-card';
import { SectionProps } from './page';

export async function Section2({ params, contributionStats, paymentStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });
	const paymentFees = _.sumBy(contributionStats.totalPaymentFeesByIsInstitution, 'amount');

	// TODO: Calculate these costs dynamically
	const transactionFees = 8600;
	const operatingCosts = 9300;
	const otherCosts = 9600;
	const totalCosts = paymentFees + transactionFees + operatingCosts + otherCosts;

	return (
		<div>
			<Typography weight="bold" size="3xl" className="mb-8">
				{translator.t('section-2.title')}
			</Typography>
			<InfoCard
				sectionTitle={translator.t('section-2.donations')}
				title={translator.t('amount', {
					context: { value: contributionStats.totalContributionsAmount, currency: params.currency },
				})}
				text={translator.t('section-2.amount-since-march-2020')}
				firstIcon={<HeartIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-2.contributions-from', {
									context: { value: contributionStats.totalIndividualContributionsAmount, currency: params.currency },
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
									value: paymentStats.totalPaymentsAmount,
									currency: params.currency,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-2.future-payouts', {
								context: {
									value: contributionStats.totalIndividualContributionsAmount - paymentStats.totalPaymentsAmount,
									currency: params.currency,
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
										value: contributionStats.totalInstitutionalContributionsAmount,
										currency: params.currency,
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
									value: totalCosts,
									currency: params.currency,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-2.future-costs', {
								context: {
									value: contributionStats.totalInstitutionalContributionsAmount - totalCosts,
									currency: params.currency,
								},
							})}
						</Typography>
					</div>
				}
			/>
		</div>
	);
}
