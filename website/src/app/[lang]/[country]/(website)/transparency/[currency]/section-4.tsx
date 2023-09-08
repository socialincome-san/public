import { InfoCard } from '@/app/[lang]/[country]/(website)/transparency/[currency]/info-card';
import { SectionProps } from '@/app/[lang]/[country]/(website)/transparency/[currency]/page';
import { firestoreAdmin } from '@/firebase-admin';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import { PAYMENT_AMOUNT } from '@socialincome/shared/src/types';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Tooltip, Typography } from '@socialincome/ui';
import _ from 'lodash';

// TODO: fix tooltips on mobile
export async function Section4({ params, paymentStats, contributionStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-transparency'] });
	const paymentFees = _.sumBy(contributionStats.totalPaymentFeesByIsInstitution, 'amount');

	// TODO: make these dynamic
	const transactionFees = 8600;
	const operatingCosts = 9300;
	const otherCosts = 9600;
	const totalExpenses = paymentFees + transactionFees + operatingCosts + otherCosts + paymentStats.totalPaymentsAmount;
	const totalReserves = contributionStats.totalContributionsAmount - totalExpenses;
	const exchangeRateSLE = await getLatestExchangeRate(firestoreAdmin, 'SLE');

	return (
		<div className="flex flex-col space-y-8">
			<div>
				<Typography weight="bold" size="3xl">
					{translator.t('section-4.title')}
				</Typography>
				<Typography weight="bold" size="xl">
					{translator.t('section-4.subtitle')}
				</Typography>
			</div>
			<InfoCard
				sectionTitle={translator.t('section-4.expenses')}
				title={translator.t('amount', { context: { value: totalExpenses, currency: params.currency } })}
				text={translator.t('amount-since-march-2020')}
				firstIcon={<DevicePhoneMobileIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-4.payments-total', {
									context: {
										value: paymentStats.totalPaymentsAmount,
										currency: params.currency,
										recipientsCount: paymentStats.totalRecipientsCount,
									},
								})}
							</Typography>
						</div>
						<Typography>
							{translator.t('section-4.payments-last-month', {
								context: {
									value: _.last(paymentStats.totalPaymentsByMonth)?.amount,
									currency: params.currency,
									recipientsCount: _.last(paymentStats.totalPaymentsByMonth)?.recipientsCount,
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
				secondIcon={<BanknotesIcon className="h-8 w-8" />}
				secondContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-4.total-costs', {
									context: {
										value: paymentFees + transactionFees + operatingCosts + otherCosts,
										currency: params.currency,
									},
								})}
							</Typography>
						</div>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.payment-fees', {
								context: {
									value: paymentFees,
									currency: params.currency,
								},
							})}
							<Tooltip color="accent" message={translator.t('section-4.payment-fees-tooltip')}>
								<InformationCircleIcon className="mx-2 h-5 w-5" />
							</Tooltip>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.transaction-fees', {
								context: {
									value: transactionFees,
									currency: params.currency,
								},
							})}
							<Tooltip color="accent" message={translator.t('section-4.transaction-fees-tooltip')}>
								<InformationCircleIcon className="mx-2 h-5 w-5" />
							</Tooltip>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.operating-costs', {
								context: {
									value: operatingCosts,
									currency: params.currency,
								},
							})}
							<Tooltip color="accent" message={translator.t('section-4.operating-costs-tooltip')}>
								<InformationCircleIcon className="mx-2 h-5 w-5" />
							</Tooltip>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.other-costs', {
								context: {
									value: otherCosts,
									currency: params.currency,
								},
							})}
							<Tooltip color="accent" message={translator.t('section-4.other-costs-tooltip')}>
								<InformationCircleIcon className="mx-2 h-5 w-5" />
							</Tooltip>
						</Typography>
					</div>
				}
			/>

			<InfoCard
				sectionTitle={translator.t('section-4.reserves')}
				title={translator.t('amount', {
					context: { value: totalReserves, currency: params.currency },
				})}
				text={translator.t('amount-since-march-2020')}
				firstIcon={<DevicePhoneMobileIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<Typography as="div" weight="bold" size="lg">
							{translator.t('section-4.covers-payments')}
						</Typography>
						<Typography>
							{translator.t('section-4.covers-payments-1', {
								context: {
									recipientsCount: (totalReserves / (PAYMENT_AMOUNT / exchangeRateSLE) / 36).toFixed(0),
									monthsCount: 36,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-4.covers-payments-2', {
								context: {
									recipientsCount: (totalReserves / (PAYMENT_AMOUNT / exchangeRateSLE)).toFixed(0),
								},
							})}
						</Typography>
					</div>
				}
				secondIcon={<BuildingLibraryIcon className="h-8 w-8" />}
				secondContent={
					<div className="flex flex-col space-y-1">
						<Typography weight="bold" size="lg">
							{translator.t('section-4.reserves')}
						</Typography>
						<Typography className="flex-inline flex items-center">{translator.t('section-4.reserves-text')}</Typography>
					</div>
				}
			/>
		</div>
	);
}
