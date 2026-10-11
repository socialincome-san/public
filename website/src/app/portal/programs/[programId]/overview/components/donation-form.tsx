'use client';

import { createPortalProgramDonationCheckoutAction } from '@/modules/stripe-payments/stripe-payment.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { SegmentedToggle } from '@socialincome/design-system/actions/segmented-toggle/segmented-toggle';
import { Input } from '@socialincome/design-system/forms/input/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DonationFormProps = {
	costPerIntervalChf: number;
	programId: string;
};

export const DonationForm = ({ costPerIntervalChf, programId }: DonationFormProps) => {
	const router = useRouter();
	const [method, setMethod] = useState<'credit' | 'bank'>('credit');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		const amountNum = Number(formData.get('amount'));
		if (!Number.isFinite(amountNum) || amountNum < 1) {
			return;
		}

		setSubmitting(true);
		try {
			const result = await createPortalProgramDonationCheckoutAction({
				amount: Math.round(amountNum * 100),
				programId,
				currency: 'CHF',
				recurring: false,
			});

			if (result.success && result.data) {
				router.push(result.data);
			} else if (!result.success) {
				console.error(result.error);
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form action={handleSubmit} className="space-y-4">
			<div className="space-y-1">
				<h3 className="text-base font-medium">Pay directly</h3>
				<p className="text-muted-foreground text-sm">
					The fastest way to launch. Cover the starting balance to activate transfers immediately.
				</p>
			</div>
			<SegmentedToggle
				value={method}
				onValueChange={(v) => setMethod(v as 'credit' | 'bank')}
				options={[
					{ value: 'bank', label: 'Bank Transfer' },
					{ value: 'credit', label: 'Credit Card' },
				]}
			/>

			{method === 'credit' ? (
				<div className="space-y-3">
					<div className="text-muted-foreground text-xs">Enter an amount to donate (CHF)</div>
					<div className="flex items-center gap-3">
						<div className="w-40 md:w-48">
							<Input name="amount" type="number" min={1} step={1} defaultValue={Math.round(costPerIntervalChf)} required />
						</div>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Redirecting…' : 'Donate now'}
						</Button>
					</div>
				</div>
			) : (
				<div className="text-muted-foreground text-sm">Bank transfer — coming soon</div>
			)}
		</form>
	);
};
