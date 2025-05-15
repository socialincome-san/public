'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { websiteCurrencies } from '@/i18n';
import { Card, CardContent, CardFooter, CardHeader, FormItem, Input, Typography } from '@socialincome/ui';
import { useState } from 'react';
import { BankTransfer, BankTransferTranslations } from './bank-transfer';
import { DonationImpact } from './donation-impact';
import { DonationIntervalSelector } from './donation-interval-selector';
import { PaymentType, PaymentTypeSelector } from './payment-type-selector';
import { StripePaymentButton } from './stripe-payment-button';

const DONATION_INTERVALS = ['1', '3', '12'] as const;
type DonationInterval = (typeof DONATION_INTERVALS)[number];

const getDonationAmount = (amount: number, donationInterval: DonationInterval) => {
	return Math.round(amount * 0.01 * Number(donationInterval));
};

type DonationImpactTranslations = {
	yourMonthlyContribution: string;
	directPayout: string;
	yourImpact: string;
};

type DonationFormProps = {
	amount?: number;
	translations: {
		title: string;
		amount: string;
		howToPay: string;
		buttonText: string;
		monthly: string;
		quarterly: string;
		yearly: string;
		donationImpact: DonationImpactTranslations;
		paymentType: {
			title: string;
			creditCard: string;
			bankTransfer: string;
			creditCardDescription: string;
			bankTransferDescription: string;
		};
		bankTransfer: BankTransferTranslations;
	};
} & DefaultParams;

export function DonationForm({ amount, translations, lang, region }: DonationFormProps) {
	const [fieldValues, setFieldValues] = useState({
		monthlyIncome: amount || 0,
		paymentType: 'credit_card' as PaymentType,
		donationInterval: '1' as DonationInterval,
	});

	return (
		<div className="flex flex-col">
			<Typography weight="bold" size="3xl" className="mb-12 text-center">
				{translations.title}
			</Typography>
			<div className="flex flex-col space-y-8">
				<div className="mb-2 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
					<FormItem className="flex-1">
						<Input
							type="number"
							className="h-16 px-6 text-lg"
							placeholder={translations.amount}
							onChange={({ target }) => setFieldValues({ ...fieldValues, monthlyIncome: Number(target.value) })}
						/>
					</FormItem>
					<CurrencySelector className="h-16 w-full sm:flex-1" currencies={websiteCurrencies} fontSize="lg" />
				</div>
				{fieldValues.monthlyIncome > 0 && (
					<Card className="theme-default bg-white">
						<CardHeader>
							<DonationImpact
								lang={lang}
								monthlyIncome={fieldValues.monthlyIncome}
								translations={translations.donationImpact}
							/>
						</CardHeader>
						<CardContent className="mt-8 space-y-8">
							<DonationIntervalSelector
								onSelect={() => {}}
								lang={lang}
								monthlyIncome={fieldValues.monthlyIncome}
								translations={{
									title: translations.howToPay,
									monthly: translations.monthly,
									quarterly: translations.quarterly,
									yearly: translations.yearly,
								}}
							/>
							{region === 'ch' && (
								<PaymentTypeSelector
									translations={translations.paymentType}
									onSelect={(paymentType) => setFieldValues({ ...fieldValues, paymentType })}
									value={fieldValues.paymentType}
								/>
							)}
							{fieldValues.paymentType === 'bank_transfer' && (
								<BankTransfer
									paymentIntervalMonths={Number(fieldValues.donationInterval)}
									amount={getDonationAmount(fieldValues.monthlyIncome, fieldValues.donationInterval)}
									translations={translations.bankTransfer}
									lang={lang}
									region={region}
								/>
							)}
						</CardContent>
						<CardFooter>
							{fieldValues.paymentType === 'credit_card' && (
								<StripePaymentButton
									amount={getDonationAmount(fieldValues.monthlyIncome, fieldValues.donationInterval)}
									intervalCount={Number(fieldValues.donationInterval)}
									lang={lang}
									region={region}
									buttonText={translations.buttonText}
									paymentType={fieldValues.paymentType}
								/>
							)}
						</CardFooter>
					</Card>
				)}
			</div>
		</div>
	);
}
