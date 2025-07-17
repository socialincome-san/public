import { firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { toCurrencyLocale } from '@/lib/i18n/utils';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import { PAYMENT_AMOUNT_SLE } from '@socialincome/shared/src/types/payment';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { InfoCard } from './info-card';
import { SectionProps } from './page';
import { roundAmount } from './section-1';

export async function Section4({ params, expensesStats, paymentStats, contributionStats }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });
	const expensesTotal = _.sum(Object.values(expensesStats.totalExpensesByType)) + paymentStats.totalPaymentsAmount;
	const reservesTotal = contributionStats.totalContributionsAmount - expensesTotal;
	const exchangeRateSLE = await getLatestExchangeRate(firestoreAdmin, 'SLE');
	const currencyLocale = toCurrencyLocale(params.lang, params.region, params.currency, { maximumFractionDigits: 0 });

	return (
		<div className="flex flex-col space-y-8">
			<div>
				<Typography weight="bold" size="3xl">
					{translator.t('section-4.title')}
				</Typography>
			</div>
			<InfoCard
				sectionTitle={translator.t('section-4.expenses')}
				title={translator.t('amount', {
					context: {
						value: roundAmount(expensesTotal),
						...currencyLocale,
					},
				})}
				text={translator.t('section-4.amount-since-march-2020')}
				firstIcon={<DevicePhoneMobileIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-4.payments-total', {
									context: {
										value: roundAmount(paymentStats.totalPaymentsAmount),
										recipientsCount: paymentStats.totalRecipientsCount,
										...currencyLocale,
									},
								})}
							</Typography>
						</div>
						<Typography>
							{translator.t('section-4.payments-last-month', {
								context: {
									value: roundAmount(_.last(paymentStats.totalPaymentsByMonth)?.amount as number),
									recipientsCount: _.last(paymentStats.totalPaymentsByMonth)?.recipientsCount,
									...currencyLocale,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-4.payments-future', {
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
				secondIcon={<BanknotesIcon className="h-8 w-8" />}
				secondContent={
					<div className="flex flex-col space-y-1">
						<div className="flex-inline flex items-center">
							<Typography as="div" weight="bold" size="lg">
								{translator.t('section-4.project-costs', {
									context: {
										value: roundAmount(_.sum(Object.values(expensesStats.totalExpensesByType))),
										...currencyLocale,
									},
								})}
							</Typography>
						</div>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.donation-fees', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.donation_fees),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.donation-fees-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.delivery-fees', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.delivery_fees),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.delivery-fees-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.exchange-rate-loss', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.exchange_rate_loss),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.exchange-rate-loss-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.account-fees', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.account_fees),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.account-fees-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>

						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.staff-costs', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.staff),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.staff-costs-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.fundraising-costs', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.fundraising_advertising),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.fundraising-costs-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.administrative-costs', {
								context: {
									value: roundAmount(expensesStats.totalExpensesByType.administrative),
									...currencyLocale,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.administrative-costs-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
					</div>
				}
			/>

			<InfoCard
				sectionTitle={translator.t('section-4.reserves')}
				title={translator.t('amount', {
					context: {
						value: roundAmount(reservesTotal),
						...currencyLocale,
					},
				})}
				text={translator.t('section-4.amount-since-march-2020')}
				firstIcon={<DevicePhoneMobileIcon className="h-8 w-8" />}
				firstContent={
					<div className="flex flex-col space-y-1">
						<Typography as="div" weight="bold" size="lg">
							{translator.t('section-4.covers-payments')}
						</Typography>
						<Typography>
							{translator.t('section-4.covers-payments-1', {
								context: {
									recipientsCount: (reservesTotal / (PAYMENT_AMOUNT_SLE / exchangeRateSLE) / 36).toFixed(0),
									monthsCount: 36,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-4.covers-payments-2', {
								context: {
									recipientsCount: (reservesTotal / (PAYMENT_AMOUNT_SLE / exchangeRateSLE)).toFixed(0),
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
