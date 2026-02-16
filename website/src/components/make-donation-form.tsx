'use client';

import { Button } from '@/components/button';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

const amountOptions = [
	{ label: 'CHF', value: 25 },
	{ label: 'CHF', value: 50 },
	{ label: 'CHF', value: 100 },
	{ label: 'Other', value: null },
];

type Cadence = 'monthly' | 'one-time';
type Amount = (typeof amountOptions)[number]['value'] | undefined;

export const MakeDonationForm = () => {
	const [selectedAmount, setSelectedAmount] = useState<Amount | null>(undefined);
	const [cadence, setCadence] = useState<Cadence>('monthly');
	const [monthlyIncome, setMonthlyIncome] = useState(6000);

	return (
		<div className="text-foreground border-border w-96 rounded-3xl border bg-white p-9 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
			<h3 className="mb-5 text-2xl font-semibold leading-none">Make a donation</h3>

			<div className="border-muted mb-3 grid grid-cols-[70%_30%] overflow-hidden rounded-md border">
				<div className="border-muted border-r px-3 py-2">
					<div className="text-[10px] font-medium">Your monthly income (CHF)</div>
					<input
						type="number"
						value={monthlyIncome}
						onChange={(e) => setMonthlyIncome(Number(e.target.value))}
						className="w-full text-lg font-medium leading-none outline-none"
					/>
				</div>
				<div className="bg-muted px-3 py-2">
					<div className="text-[10px] font-medium">Your 1%</div>
					<div className="whitespace-nowrap text-lg font-medium leading-none">
						CHF {Math.round(monthlyIncome / 100)}
					</div>
				</div>
			</div>

			<div className="mb-2 text-center text-[10px] font-medium">Or choose own amount</div>
			<div className="border-muted divide-muted mb-4 grid grid-cols-4 divide-x overflow-hidden rounded-xl border">
				{amountOptions.map((option) => {
					const isSelected = option.value === selectedAmount;
					return (
						<button
							key={option.value ?? 'other'}
							type="button"
							onClick={() => setSelectedAmount(option.value)}
							className={cn(
								'flex flex-col items-center justify-center p-3 font-medium leading-none transition-colors',
								isSelected && 'bg-muted',
							)}
						>
							<span className={cn(option.label === 'Other' ? 'text-base' : 'text-[10px]')}>{option.label}</span>
							{option.value && <span>{option.value}</span>}
						</button>
					);
				})}
			</div>

			<div className="bg-accent mb-4 grid grid-cols-2 rounded-md p-1">
				<button
					type="button"
					onClick={() => setCadence('monthly')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
						cadence === 'monthly' && 'bg-white shadow-sm',
					)}
				>
					Monthly
				</button>
				<button
					type="button"
					onClick={() => setCadence('one-time')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
						cadence === 'one-time' && 'bg-white shadow-sm',
					)}
				>
					One-time
				</button>
			</div>

			<Button className="h-10 w-full text-sm font-semibold">Donate now</Button>
		</div>
	);
};
