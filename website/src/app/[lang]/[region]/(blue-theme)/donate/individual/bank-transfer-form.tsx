'use client';

import { Button, Input, Typography } from '@socialincome/ui';
import { useFormContext } from 'react-hook-form';
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

	const monthlyAmount = Math.round(amount * 0.01);
	const fullSocialIncomeAmount = 32;
	const partialSocialIncomeAmount = monthlyAmount - fullSocialIncomeAmount;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		form.handleSubmit((data) => {
			console.log('Form submitted:', data);
		})(e);
	};

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
					<Button size="lg" type="submit" className="w-full" onClick={handleSubmit}>
						{translations.generateQrBill}
					</Button>
				</div>
			</div>
		</div>
	);
}
