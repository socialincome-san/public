'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { BankTransferForm, BankTransferFormProps } from '@/components/donation/bank-transfer-form';
import { PaymentTypes } from '@/components/donation/generic-donation-form';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { useI18n } from '@/lib/i18n/useI18n';
import { websiteCurrencies, WebsiteLanguage } from '@/lib/i18n/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	Form,
	FormControl,
	FormField,
	FormItem,
	Input,
	Typography,
} from '@socialincome/ui';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { DonationIntervalSelector } from './donation-interval-selector';
import { PaymentTypeSelector } from './payment-type-selector';
import { StripePaymentButton } from './stripe-payment-button';

const DONATION_INTERVALS = ['1', '3', '12'] as const;
type DonationInterval = (typeof DONATION_INTERVALS)[number];

const getTextOption = (amount: number) => {
	const thresholds = [10, 15, 30, 60, 90, 120, 150, 300, Infinity];
	const index = thresholds.findIndex((threshold) => amount < threshold);
	return index === -1 ? 0 : index;
};

const getDonationAmount = (amount: number, donationInterval: DonationInterval) => {
	return Math.round(amount * 0.01 * Number(donationInterval));
};

type DonationImpactTranslations = {
	yourMonthlyContribution: string;
	directPayout: string;
	yourImpact: string;
};

type DonationImpactProps = {
	lang: WebsiteLanguage;
	translations: DonationImpactTranslations;
};

function DonationImpact({ lang, translations }: DonationImpactProps) {
	const amount = Math.round(useWatch({ name: 'monthlyIncome' }) * 0.01);
	const translator = useTranslator(lang, 'website-donate');
	const { currency } = useI18n();
	const textOption = getTextOption(amount);

	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div className="space-y-2">
				<Typography size="lg" weight="medium">
					{translations.yourMonthlyContribution}
				</Typography>
				<Typography size="xl" weight="bold">
					{translator?.t('amount-currency', {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
				<Typography size="md">{translations.directPayout}</Typography>
			</div>
			<div className="space-y-2">
				<Typography size="lg" weight="medium">
					{translations.yourImpact}
				</Typography>
				<Typography>
					{translator?.t(`donation-impact.${textOption}`, {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
			</div>
		</div>
	);
}

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
		bankTransfer: BankTransferFormProps['translations'];
	};
} & DefaultParams;

export function DonationForm({ amount, translations, lang, region }: DonationFormProps) {
	const { currency } = useI18n();

	const formSchema = z
		.object({
			monthlyIncome: z.coerce.number().min(1),
			donationInterval: z.enum(DONATION_INTERVALS),
			paymentType:
				region === 'ch'
					? z.enum(Object.values(PaymentTypes) as [string, ...string[]])
					: z.literal(PaymentTypes.CREDIT_CARD),
			email: z.string().email().optional(),
			firstName: z.string().optional(),
			lastName: z.string().optional(),
		})
		.superRefine((data, ctx) => {
			if (data.paymentType === 'bank_transfer') {
				if (!data.email) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['email'],
					});
				}
				if (!data.firstName) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['firstName'],
					});
				}
				if (!data.lastName) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['lastName'],
					});
				}
			}
		});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			donationInterval: '1',
			monthlyIncome: amount || ('' as any),
			paymentType: PaymentTypes.CREDIT_CARD,
			email: '',
			firstName: '',
			lastName: '',
		},
	});

	return (
		<div className="flex flex-col">
			<Typography weight="bold" size="3xl" className="mb-12 text-center">
				{translations.title}
			</Typography>
			<Form {...form}>
				<form className="flex flex-col space-y-8">
					<div className="mb-2 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
						<FormField
							control={form.control}
							name="monthlyIncome"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormControl>
										<Input className="h-16 px-6 text-lg" placeholder={translations.amount} {...field} type="number" />
									</FormControl>
								</FormItem>
							)}
						/>
						<CurrencySelector className="h-16 w-full sm:flex-1" currencies={websiteCurrencies} fontSize="lg" />
					</div>
					{form.watch('monthlyIncome') > 0 && (
						<Card className="theme-default bg-white">
							<CardHeader>
								<DonationImpact lang={lang} translations={translations.donationImpact} />
							</CardHeader>
							<CardContent className="mt-8 space-y-8">
								<DonationIntervalSelector
									lang={lang}
									monthlyIncome={form.watch('monthlyIncome')}
									translations={{
										title: translations.howToPay,
										monthly: translations.monthly,
										quarterly: translations.quarterly,
										yearly: translations.yearly,
									}}
								/>
								{region === 'ch' && currency && ['CHF', 'EUR'].includes(currency) && (
									<PaymentTypeSelector
										lang={lang}
										translations={translations.paymentType}
										bankTransferForm={
											<div className="border-accent bg-card-muted !mt-[-2px] rounded-b-lg border-2 p-4 md:rounded-tl-lg md:p-8">
												<BankTransferForm
													lang={lang}
													region={region}
													qrBillType={window.innerWidth < 768 ? 'QRCODE' : 'QRBILL'}
													intervalCount={Number(form.watch('donationInterval'))}
													amount={getDonationAmount(form.watch('monthlyIncome'), form.watch('donationInterval'))}
													translations={translations.bankTransfer}
												/>
											</div>
										}
									/>
								)}
							</CardContent>
							<CardFooter>
								{form.watch('paymentType') === PaymentTypes.CREDIT_CARD && (
									<StripePaymentButton
										amount={getDonationAmount(form.watch('monthlyIncome'), form.watch('donationInterval'))}
										intervalCount={Number(form.watch('donationInterval'))}
										lang={lang}
										region={region}
										buttonText={translations.buttonText}
									/>
								)}
							</CardFooter>
						</Card>
					)}
				</form>
			</Form>
		</div>
	);
}
