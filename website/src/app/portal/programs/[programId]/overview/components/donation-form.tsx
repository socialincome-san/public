'use client';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { useState } from 'react';

type DonationFormProps = {
	costPerIntervalChf: number;
	programId: string;
};

export const DonationForm = ({ costPerIntervalChf, programId }: DonationFormProps) => {
	const [method, setMethod] = useState<'credit' | 'bank'>('credit');
	const [amount, setAmount] = useState<string>(String(Math.round(costPerIntervalChf)));

	return (
		<div className="space-y-4">
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
					<div className="text-muted-foreground text-xs">Enter an amount to donate</div>
					<div className="flex items-center gap-3">
						<Input
							className="w-40 md:w-48"
							type="number"
							min={1}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<Button>Donate now</Button>
					</div>
				</div>
			) : (
				<div className="text-muted-foreground text-sm">Bank transfer — coming soon</div>
			)}
		</div>
	);
}
