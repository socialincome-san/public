'use client';

import { CreateUserData } from '@/app/api/user/create/route';
import { generateQrBillSvg } from '@/utils/qr-bill';
import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@socialincome/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';

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
			qrBillError: string;
		};
	};
};

export function BankTransferForm({ amount, paymentIntervalMonths, translations }: BankTransferFormProps) {
	const form = useFormContext();
	const [qrBillSvg, setQrBillSvg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			setIsLoading(true);
			const { email, firstName, lastName } = form.getValues();
			const response = await fetch('/api/user/create', {
				method: 'POST',
				body: JSON.stringify({
					email,
					personal: {
						name: firstName,
						lastname: lastName,
					},
					address: {
						country: 'CH', // only CH is supported for now
					},
					currency: 'CHF', // only CHF is supported for now
				} as CreateUserData),
			});

			if (!response.ok) {
				throw new Error('Failed to create user');
			}

			setQrBillSvg(generateQrBillSvg(amount, paymentIntervalMonths, (await response.json()).payment_reference_id));
			setIsSubmitted(true);
		} catch (error) {
			toast.error(translations.errors.qrBillError);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="border-accent bg-card-muted !mt-[-2px] rounded-b-lg border-2 p-4 md:rounded-tl-lg md:p-8">
			<>
				{isSubmitted && qrBillSvg ? (
					<>
						<div className="my-8 flex justify-center space-y-4">
							<div dangerouslySetInnerHTML={{ __html: qrBillSvg }} className="max-w-full" />
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
