'use client';

import { SubmitBankTransferRequest } from '@/app/api/bank-transfer/submit/route';
import { useI18n } from '@/components/providers/context-providers';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { generateQrBillSvg } from '@/utils/qr-bill';
import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, linkCn } from '@socialincome/ui';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';

export type BankTransferFormProps = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	amount: number;
	intervalCount: number;
	translations: {
		firstName: string;
		lastName: string;
		email: string;
		plan: string;
		yourContribution: string;
		fullSocialIncome: string;
		partialSocialIncome: string;
		weMatchTheMissing: string;
		generateQrBill: string;
		confirmMonthlyOrder: string;
		transferFeesNote: string;
		plusPlanLink: string;
		confirmPayment: string;
		paymentSuccess: string;
		loginLink: string;
		generating: string;
		processing: string;
		errors: {
			emailRequired: string;
			emailInvalid: string;
			qrBillError: string;
			paymentFailed: string;
		};
	};
};

type UserFormData = {
	email: string;
	firstName: string;
	lastName: string;
	paymentReferenceId: number;
};

export function BankTransferForm({ amount, intervalCount, translations, lang, region }: BankTransferFormProps) {
	const form = useFormContext();
	const { currency } = useI18n();
	const [userData, setUserData] = useState<UserFormData | null>(null);
	const [qrBillSvg, setQrBillSvg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [paid, setPaid] = useState(false);
	const qrBillRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (qrBillRef.current && qrBillSvg) {
			qrBillRef.current.innerHTML = qrBillSvg;
		}
	}, [qrBillSvg]);

	const generateQRCode = async (event: React.FormEvent) => {
		event.preventDefault();
		event.stopPropagation();

		try {
			setIsLoading(true);
			const { email, firstName, lastName } = form.getValues();

			if (!currency) {
				throw new Error('Currency is required');
			}

			const response = await fetch(`/api/bank-transfer/payment-reference/create`, {
				method: 'POST',
				body: JSON.stringify({ email }),
			});
			const { paymentReferenceId } = await response.json();

			setUserData({
				email,
				firstName,
				lastName,
				paymentReferenceId,
			});

			setQrBillSvg(
				generateQrBillSvg({
					amount,
					paymentIntervalMonths: intervalCount,
					paymentReferenceId,
					currency: currency as 'CHF' | 'EUR',
					type: window.innerWidth < 768 ? 'QRCODE' : 'QRBILL',
				}),
			);
		} catch (error) {
			toast.error(translations.errors.qrBillError);
		} finally {
			setIsLoading(false);
		}
	};

	const confirmPayment = async (event: React.FormEvent) => {
		event.preventDefault();
		event.stopPropagation();

		try {
			setIsLoading(true);

			const response = await fetch('/api/bank-transfer/submit', {
				method: 'POST',
				body: JSON.stringify({
					user: userData,
					payment: {
						amount: amount,
						intervalCount: intervalCount,
						currency: currency,
						recurring: true,
					},
				} as SubmitBankTransferRequest),
			});

			if (!response.ok) {
				throw new Error('Failed to create user');
			}
		} catch (error) {
			toast.error(translations.errors.paymentFailed);
		} finally {
			setIsLoading(false);
			setPaid(true);
		}
	};

	return (
		<div className="border-accent bg-card-muted !mt-[-2px] rounded-b-lg border-2 p-4 md:rounded-tl-lg md:p-8">
			{paid ? (
				<div className="space-y-4 pb-8">
					<p>{translations.paymentSuccess}</p>
					<Link className={linkCn({ underline: 'always' })} href={`/${lang}/${region}/me/contributions`}>
						{translations.loginLink}
					</Link>
				</div>
			) : qrBillSvg ? (
				<>
					<div className="my-8 flex justify-center space-y-4">
						{qrBillSvg && <div className="max-w-full" ref={qrBillRef} />}
					</div>
					<Button disabled={isLoading} size="lg" type="submit" className="w-full" onClick={confirmPayment}>
						{isLoading ? translations.processing : translations.confirmPayment}
					</Button>
				</>
			) : (
				<>
					<div className="space-y-4 pb-8">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{translations.firstName}</FormLabel>
									<FormControl>
										<Input type="text" required className="h-14 rounded-xl bg-white px-6" {...field} />
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
										<Input type="text" required className="h-14 rounded-xl bg-white px-6" {...field} />
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
										<Input type="email" required className="h-14 rounded-xl bg-white px-6" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button
						size="lg"
						type="submit"
						className="w-full"
						onClick={generateQRCode}
						disabled={isLoading || !form.formState.isValid}
					>
						{isLoading ? translations.generating : translations.generateQrBill}
					</Button>
				</>
			)}
		</div>
	);
}
