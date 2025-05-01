'use client';

import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Typography } from '@socialincome/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Data } from 'swissqrbill/lib/cjs/shared/types';
import { SwissQRBill } from 'swissqrbill/svg';

type BankTransferFormProps = {
	amount: number;
	translations: {
		paymentDetails: string;
		firstName: string;
		lastName: string;
		email: string;
		street: string;
		city: string;
		zip: string;
		plan: string;
		yourContribution: string;
		fullSocialIncome: string;
		partialSocialIncome: string;
		weMatchTheMissing: string;
		generateQrBill: string;
		confirmMonthlyOrder: string;
		transferFeesNote: string;
		plusPlanLink: string;
	};
};

export function BankTransferForm({ amount, translations }: BankTransferFormProps) {
	const form = useFormContext();
	const [qrBill, setQrBill] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const monthlyAmount = Number(amount);
	const fullSocialIncomeAmount = 32;
	const partialSocialIncomeAmount = monthlyAmount - fullSocialIncomeAmount;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			setIsLoading(true);
			const formData = form.getValues();
			const { firstName, lastName, email, street, city, zip } = formData;

			// Extract street number from street address
			const streetParts = street.trim().split(' ');
			const streetNumber = streetParts.length > 1 ? streetParts.pop() : '';
			const streetName = streetParts.join(' ') || street;

			const data: Data = {
				amount: monthlyAmount,
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
				debtor: {
					address: streetName,
					city,
					buildingNumber: streetNumber,
					country: 'CH',
					name: `${firstName} ${lastName}`,
					zip: parseInt(zip),
				},
				reference: '21 00000 00003 13947 14300 09017',
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

	if (isSubmitted && qrBill) {
		return (
			<div className="rounded-3xl bg-blue-500 p-12">
				<Typography size="5xl" className="mb-8 text-yellow-400">
					{translations.paymentDetails}
				</Typography>
				<div className="mt-4 flex justify-center">
					<div dangerouslySetInnerHTML={{ __html: qrBill }} className="max-w-full" />
				</div>
				<div className="mt-8">
					<Button
						size="lg"
						type="button"
						className="text-primary h-14 w-full rounded-full bg-yellow-400 text-lg font-medium hover:bg-yellow-300"
					>
						{translations.confirmMonthlyOrder}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-3xl bg-blue-500 p-12">
			<Typography size="5xl" className="mb-8 text-yellow-400">
				{translations.paymentDetails}
			</Typography>

			<div className="mb-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
				<div className="space-y-8">
					<Typography size="xl" weight="medium" className="flex items-start text-white">
						<span className="mr-2">1.</span>
						<span>Please provide your information for the payment.</span>
					</Typography>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-white">{translations.firstName}</FormLabel>
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
									<FormLabel className="text-white">{translations.lastName}</FormLabel>
									<FormControl>
										<Input type="text" required className="h-14 rounded-xl bg-white px-6" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="street"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-white">{translations.street}</FormLabel>
									<FormControl>
										<Input
											type="text"
											required
											className="h-14 rounded-xl bg-white px-6"
											placeholder="Street and number"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-4 gap-4">
							<FormField
								control={form.control}
								name="zip"
								render={({ field }) => (
									<FormItem className="col-span-1">
										<FormLabel className="text-white">{translations.zip}</FormLabel>
										<FormControl>
											<Input type="text" required className="h-14 rounded-xl bg-white px-6" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem className="col-span-3">
										<FormLabel className="text-white">{translations.city}</FormLabel>
										<FormControl>
											<Input type="text" required className="h-14 rounded-xl bg-white px-6" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<Typography size="xl" weight="medium" className="flex items-start text-white">
						<span className="mr-2">2.</span>
						<span>Email for login and email with the payment details</span>
					</Typography>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-white">{translations.email}</FormLabel>
								<FormControl>
									<Input type="email" required className="h-14 rounded-xl bg-white px-6" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>

			<Button
				size="lg"
				type="submit"
				className="text-primary h-14 w-full rounded-full bg-yellow-400 text-lg font-medium hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
				onClick={handleSubmit}
				disabled={isLoading || !form.formState.isValid}
			>
				{isLoading ? 'Generating...' : translations.generateQrBill}
			</Button>
		</div>
	);
}
