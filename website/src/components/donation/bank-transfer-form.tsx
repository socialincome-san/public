'use client';

import { Button } from '@/components/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { useContributorSession } from '@/lib/firebase/hooks/useContributorSession';
import { useBankTransfer } from '@/lib/hooks/useBankTransfer';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import Link from 'next/link';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export type BankTransferFormTranslations = {
	firstName: string;
	lastName: string;
	email: string;
	generateQrBill: string;
	standingOrderQrInfo: string;
	confirmPayment: string;
	paymentSuccess: string;
	loginLink: string;
	profileLink: string;
	generating: string;
	processing: string;
	errors: {
		emailRequired: string;
		emailInvalid: string;
		qrBillError: string;
		paymentFailed: string;
	};
};

type Props = {
	qrBillType: 'QRCODE' | 'QRBILL';
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	amount: number;
	intervalCount: number;
	translations: BankTransferFormTranslations;
};

export const BankTransferForm = ({ amount, intervalCount, translations, lang, region, qrBillType }: Props) => {
	const form = useFormContext();
	const { currency } = useI18n();
	const { contributorSession } = useContributorSession();

	useEffect(() => {
		if (!contributorSession) {
			return;
		}
		form.setValue('email', contributorSession.email ?? '');
		form.setValue('firstName', contributorSession.firstName ?? '');
		form.setValue('lastName', contributorSession.lastName ?? '');
		void form.trigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contributorSession]);

	const { qrBillSvg, isLoading, paid, generateQRCode, confirmPayment } = useBankTransfer({
		amount,
		intervalCount,
		currency: currency ?? '',
		qrBillType,
		translations,
	});

	const handleGenerateQRCode = () => {
		const { email, firstName, lastName } = form.getValues();
		if (typeof email === 'string' && typeof firstName === 'string' && typeof lastName === 'string') {
			generateQRCode(email, firstName, lastName, lang);
		}
	};

	return (
		<div className="text-foreground">
			{paid ? (
				<div className="space-y-4">
					<p>{translations.paymentSuccess}</p>
					<Link className="text-primary font-medium underline" href={`/${lang}/${region}/dashboard/contributions`}>
						{contributorSession ? translations.profileLink : translations.loginLink}
					</Link>
				</div>
			) : qrBillSvg ? (
				<>
					<div className="my-6 flex flex-col items-center gap-4">
						<div className="max-w-full" dangerouslySetInnerHTML={{ __html: qrBillSvg }} />
						{intervalCount > 0 ? <p className="text-muted-foreground text-sm">{translations.standingOrderQrInfo}</p> : null}
					</div>
					<Button type="button" className="w-full" disabled={isLoading} onClick={confirmPayment}>
						{isLoading ? translations.processing : translations.confirmPayment}
					</Button>
				</>
			) : (
				<>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.firstName}</FormLabel>
									<FormControl>
										<Input className="h-12 rounded-xl" {...field} disabled={!!contributorSession?.firstName} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.lastName}</FormLabel>
									<FormControl>
										<Input className="h-12 rounded-xl" {...field} disabled={!!contributorSession?.lastName} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.email}</FormLabel>
									<FormControl>
										<Input type="email" className="h-12 rounded-xl" {...field} disabled={!!contributorSession} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button
						type="button"
						className="mt-4 w-full"
						disabled={isLoading || !form.formState.isValid}
						onClick={handleGenerateQRCode}
					>
						{isLoading ? translations.generating : translations.generateQrBill}
					</Button>
				</>
			)}
		</div>
	);
};
