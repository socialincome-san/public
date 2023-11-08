import { HeartIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { InfoCard } from './info-card';
import { SectionProps } from './page';

export async function Section2({ params, contributionStats, paymentStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-transparency'] });
	const paymentFees = _.sumBy(contributionStats.totalPaymentFeesByIsInstitution, 'amount');
	const transactionFees = 8600;
	const operatingCosts = 9300;
	const otherCosts = 9600;

	return (
		<div className="flex flex-col space-y-8">
			<Typography weight="bold" size="3xl">
				{translator.t('section-2.title')}
			</Typography>
			<InfoCard
				sectionTitle={translator.t('section-2.donations')}
				title={translator.t('amount', {
					context: { value: contributionStats.totalContributionsAmount, currency: params.currency },
				})}
				text={translator.t('amount-since-march-2020')}
				firstIcon={<HeartIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-2.contributions-from', {
									context: { value: contributionStats.totalIndividualContributionsAmount, currency: params.currency },
								})}
								<Badge className="mx-1">
									{translator.t('section-2.individuals', {
										context: { count: contributionStats.totalIndividualContributorsCount },
									})}
								</Badge>
							</Typography>
						</div>
						<Typography>
							{translator.t('past-payouts', {
								context: {
									value: paymentStats.totalPaymentsAmount,
									currency: params.currency,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('future-payouts', {
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
								<Badge className="mx-1">
									{translator.t('section-2.institutions', {
										context: { count: contributionStats.totalInstitutionalContributorsCount },
									})}
								</Badge>
							</Typography>
						</div>
						<Typography>
							{translator.t('section-2.used-for-fees', {
								context: { value: paymentFees, currency: params.currency },
							})}
						</Typography>
						<Typography>
							{translator.t('section-2.used-for-operating-costs', {
								context: {
									value: paymentFees + transactionFees + operatingCosts + otherCosts,
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
