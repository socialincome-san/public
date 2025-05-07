'use client';

import { generateQrBillReference } from '@/utils/qr-bill';
import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@socialincome/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Data } from 'swissqrbill/lib/cjs/shared/types';
import { SwissQRBill } from 'swissqrbill/svg';

type BankTransferFormProps = {
	amount: number;
	paymentIntervalMonths: number;
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
		subscribeTo1PercentPlan: string;
		errors: {
			emailRequired: string;
			emailInvalid: string;
		};
	};
};

export function BankTransferForm({ amount, paymentIntervalMonths, translations }: BankTransferFormProps) {
	const form = useFormContext();
	const [qrBill, setQrBill] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			setIsLoading(true);
			const userCreatedAt = Date.now();
			const reference = generateQrBillReference(paymentIntervalMonths, userCreatedAt);
			const data: Data = {
				amount: Number(amount),
				creditor: {
					account: 'CH44 3199 9123 0008 8901 2',
					address: 'Musterstrasse',
					buildingNumber: 7,
					city: 'Musterstadt',
					country: 'CH',
					name: 'SwissQRBill',
					zip: 1234,
				},
				currency: 'CHF',
				reference,
			};

			const svg = new SwissQRBill(data);
			setQrBill(svg.toString());
			setIsSubmitted(true);
		} catch (error) {
			console.error('Error generating QR bill:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="border-accent bg-card-muted !mt-[-2px] rounded-b-lg border-2 p-4 md:rounded-tl-lg md:p-8">
			<>
				{isSubmitted && qrBill ? (
					<>
						<div className="my-8 flex justify-center space-y-4">
							<div dangerouslySetInnerHTML={{ __html: qrBill }} className="max-w-full" />
						</div>
						<Button size="lg" type="button" className="w-full" onClick={() => setIsSubmitted(false)}>
							{translations.subscribeTo1PercentPlan}
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
							onClick={handleSubmit}
							disabled={isLoading || !form.formState.isValid}
						>
							{isLoading ? 'Generating...' : translations.generateQrBill}
						</Button>
					</>
				)}
			</>
		</div>
	);
}
