import { firestoreAdmin } from '@/firebase-admin';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import { PAYMENT_AMOUNT } from '@socialincome/shared/src/types/payment';
import { getLatestExchangeRate } from '@socialincome/shared/src/utils/exchangeRates';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Typography } from '@socialincome/ui';
import _ from 'lodash';
import { InfoCard } from './info-card';
import { SectionProps } from './page';
import { roundAmount } from './section-1';

export async function Section4({ params, paymentStats, contributionStats, costs }: SectionProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-finances'] });
	const expensesTotal = _.sum(Object.values(costs)) + paymentStats.totalPaymentsAmount;
	const reservesTotal = contributionStats.totalContributionsAmount - expensesTotal;
	const exchangeRateSLE = await getLatestExchangeRate(firestoreAdmin, 'SLE');

	return (
		<div className="flex flex-col space-y-8">
			<div>
				<Typography weight="bold" size="3xl">
					{translator.t('section-4.title')}
				</Typography>
				<Typography size="lg">{translator.t('section-4.subtitle')}</Typography>
			</div>
			<InfoCard
				sectionTitle={translator.t('section-4.expenses')}
				title={translator.t('amount', {
					context: {
						value: roundAmount(expensesTotal),
						currency: params.currency,
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
										currency: params.currency,
										recipientsCount: paymentStats.totalRecipientsCount,
									},
								})}
							</Typography>
						</div>
						<Typography>
							{translator.t('section-4.payments-last-month', {
								context: {
									value: roundAmount(_.last(paymentStats.totalPaymentsByMonth)?.amount as number),
									currency: params.currency,
									recipientsCount: _.last(paymentStats.totalPaymentsByMonth)?.recipientsCount,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-4.payments-future', {
								context: {
									value: roundAmount(
										contributionStats.totalIndividualContributionsAmount - paymentStats.totalPaymentsAmount,
									),
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
								{translator.t('section-4.project-costs', {
									context: { value: roundAmount(_.sum(Object.values(costs))), currency: params.currency },
								})}
							</Typography>
						</div>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.transaction-costs', {
								context: {
									value: roundAmount(costs.transaction),
									currency: params.currency,
								},
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.transaction-costs-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.delivery-costs', {
								context: { value: roundAmount(costs.delivery), currency: params.currency },
							})}
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger>
										<InformationCircleIcon className="mx-2 h-5 w-5" />
									</TooltipTrigger>
									<TooltipContent>{translator.t('section-4.delivery-costs-tooltip')}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Typography>
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.administrative-costs', {
								context: { value: roundAmount(costs.administrative), currency: params.currency },
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
						<Typography as="div" className="flex-inline flex items-center">
							{translator.t('section-4.fundraising-costs', {
								context: { value: roundAmount(costs.fundraising), currency: params.currency },
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
							{translator.t('section-4.staff-costs', {
								context: { value: roundAmount(costs.staff), currency: params.currency },
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
					</div>
				}
			/>

			<InfoCard
				sectionTitle={translator.t('section-4.reserves')}
				title={translator.t('amount', {
					context: { value: roundAmount(reservesTotal), currency: params.currency },
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
									recipientsCount: (reservesTotal / (PAYMENT_AMOUNT / exchangeRateSLE) / 36).toFixed(0),
									monthsCount: 36,
								},
							})}
						</Typography>
						<Typography>
							{translator.t('section-4.covers-payments-2', {
								context: {
									recipientsCount: (reservesTotal / (PAYMENT_AMOUNT / exchangeRateSLE)).toFixed(0),
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
