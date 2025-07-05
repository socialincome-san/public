'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useBankTransfer } from '@/lib/hooks/useBankTransfer';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, linkCn } from '@socialincome/ui';
import Link from 'next/link';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export type BankTransferFormProps = {
	qrBillType: 'QRCODE' | 'QRBILL';
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	amount: number;
	intervalCount: number;
	translations: {
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
};

export function BankTransferForm({
	amount,
	intervalCount,
	translations,
	lang,
	region,
	qrBillType,
}: BankTransferFormProps) {
	const form = useFormContext();
	const { currency } = useI18n();
	const { authUser } = useAuth();

	useEffect(() => {
		if (!authUser) {
			return;
		}
		form.setValue('email', authUser.email || '');
		form.setValue('firstName', authUser.displayName?.split(' ')[0]);
		form.setValue('lastName', authUser.displayName?.split(' ')[1]);
		form.trigger();
	}, [authUser]);

	const { qrBillSvg, isLoading, paid, generateQRCode, confirmPayment } = useBankTransfer({
		amount,
		intervalCount,
		currency: currency || '',
		qrBillType,
		translations,
	});

	const handleGenerateQRCode = async () => {
		const { email, firstName, lastName } = form.getValues();
		await generateQRCode(email, firstName, lastName);
	};

	return (
		<div>
			{paid ? (
				<div className="space-y-4 pb-8">
					<p>{translations.paymentSuccess}</p>
					<Link className={linkCn({ variant: 'accent' })} href={`/${lang}/${region}/me/contributions`}>
						{authUser ? translations.profileLink : translations.loginLink}
					</Link>
				</div>
			) : qrBillSvg ? (
				<>
					<div className="my-8 flex flex-col items-center justify-center space-y-4">
						<div className="max-w-full" dangerouslySetInnerHTML={{ __html: qrBillSvg }} />
						{intervalCount > 0 && <p>{translations.standingOrderQrInfo}</p>}
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
										<Input
											type="text"
											required
											className="h-14 rounded-xl bg-white px-6"
											{...field}
											disabled={!!authUser}
										/>
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
										<Input
											type="text"
											required
											className="h-14 rounded-xl bg-white px-6"
											{...field}
											disabled={!!authUser}
										/>
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
										<Input
											type="email"
											required
											className="h-14 rounded-xl bg-white px-6"
											{...field}
											disabled={!!authUser}
										/>
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
						onClick={async (event) => {
							await handleGenerateQRCode();
						}}
						disabled={isLoading || !form.formState.isValid}
					>
						{isLoading ? translations.generating : translations.generateQrBill}
					</Button>
				</>
			)}
		</div>
	);
}
