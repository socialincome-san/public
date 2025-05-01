'use client';

import { Button, Input, Typography } from '@socialincome/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Data } from 'swissqrbill/lib/cjs/shared/types';
import { SwissQRBill } from 'swissqrbill/svg';
import { z } from 'zod';
const formSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type BankTransferFormProps = {
	amount: number;
	translations: {
		paymentDetails: string;
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
		errors: {
			firstNameRequired: string;
			lastNameRequired: string;
			emailRequired: string;
			emailInvalid: string;
		};
	};
};

export function BankTransferForm({ amount, translations }: BankTransferFormProps) {
	const form = useFormContext();
	const {
		formState: { errors },
		register,
	} = form;
	const [qrBill, setQrBill] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const monthlyAmount = Number(amount);
	const fullSocialIncomeAmount = 32;
	const partialSocialIncomeAmount = monthlyAmount - fullSocialIncomeAmount;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		form.handleSubmit(async (formData) => {
			setIsLoading(true);
			const { firstName, lastName, email } = formData;

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
					address: 'Musterstrasse',
					buildingNumber: 1,
					city: 'Musterstadt',
					country: 'CH',
					name: `${firstName} ${lastName}`,
					zip: 1234,
				},
				reference: '21 00000 00003 13947 14300 09017',
			};

			try {
				const svg = new SwissQRBill(data);
				setQrBill(svg.toString());
				setIsSubmitted(true);
			} catch (error) {
				console.error('Error generating QR bill:', error);
			} finally {
				setIsLoading(false);
			}
		})(event);
	};

	if (isSubmitted && qrBill) {
		return (
			<div className="mt-8 space-y-4">
				<Typography size="xl" weight="bold">
					{translations.paymentDetails}
				</Typography>
				<div className="mt-4 flex justify-center">
					<div dangerouslySetInnerHTML={{ __html: qrBill }} className="max-w-full" />
				</div>
				<div className="space-y-4 rounded-lg bg-white p-6">
					<Button size="lg" type="button" className="w-full">
						{translations.confirmMonthlyOrder}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="mt-8 space-y-4">
			<Typography size="xl" weight="bold">
				{translations.paymentDetails}
			</Typography>

			<div className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Input
							id="firstName"
							placeholder={`${translations.firstName} *`}
							{...register('firstName', {
								required: translations.errors.firstNameRequired,
							})}
							className={errors.firstName ? 'border-destructive' : ''}
						/>
						{errors.firstName && <p className="text-destructive mt-1 text-sm">{errors.firstName.message as string}</p>}
					</div>
					<div>
						<Input
							id="lastName"
							placeholder={`${translations.lastName} *`}
							{...register('lastName', {
								required: translations.errors.lastNameRequired,
							})}
							className={errors.lastName ? 'border-destructive' : ''}
						/>
						{errors.lastName && <p className="text-destructive mt-1 text-sm">{errors.lastName.message as string}</p>}
					</div>
					<div>
						<Input
							id="email"
							type="email"
							placeholder={`${translations.email} *`}
							{...register('email', {
								required: translations.errors.emailRequired,
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: translations.errors.emailInvalid,
								},
							})}
							className={errors.email ? 'border-destructive' : ''}
						/>
						{errors.email && <p className="text-destructive mt-1 text-sm">{errors.email.message as string}</p>}
					</div>
				</div>

				<div className="space-y-4 rounded-lg bg-white p-6">
					<Button size="lg" type="submit" className="w-full" onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? 'Generating...' : translations.generateQrBill}
					</Button>
				</div>
			</div>
		</div>
	);
}
