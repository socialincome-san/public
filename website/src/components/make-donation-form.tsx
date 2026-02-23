'use client';

import { Button } from '@/components/button';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

const amountOptions = [
	{ labelKey: 'currency-prefix' as const, value: 25 },
	{ labelKey: 'currency-prefix' as const, value: 50 },
	{ labelKey: 'currency-prefix' as const, value: 100 },
	{ labelKey: 'other' as const, value: null },
];

type Cadence = 'monthly' | 'one-time';
type Amount = (typeof amountOptions)[number]['value'] | undefined;

type Props = {
	lang: WebsiteLanguage;
};

export const MakeDonationForm = ({ lang }: Props) => {
	const [selectedAmount, setSelectedAmount] = useState<Amount | null>(undefined);
	const [cadence, setCadence] = useState<Cadence>('monthly');
	const [monthlyIncome, setMonthlyIncome] = useState(6000);

	const translator = useTranslator(lang, 'website-donate');
	const t = (key: string) => translator?.t(`donation-form.${key}`) ?? '';

	return (
		<div className="text-foreground border-border w-96 rounded-3xl border bg-white p-9 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
			<h3 className="mb-5 text-2xl leading-none font-semibold">{t('title')}</h3>

			<div className="border-muted mb-3 grid grid-cols-[70%_30%] overflow-hidden rounded-md border">
				<div className="border-muted border-r px-3 py-2">
					<div className="text-[10px] font-medium">{t('monthly-income-label')}</div>
					<input
						type="number"
						value={monthlyIncome}
						onChange={(e) => {
							const parsed = parseFloat(e.target.value);
							setMonthlyIncome(isNaN(parsed) ? 0 : parsed);
						}}
						className="w-full text-lg leading-none font-medium outline-hidden"
					/>
				</div>
				<div className="bg-muted px-3 py-2">
					<div className="text-[10px] font-medium">{t('your-one-percent')}</div>
					<div className="text-lg leading-none font-medium whitespace-nowrap">
						{t('currency-prefix')} {Math.round(monthlyIncome / 100)}
					</div>
				</div>
			</div>

			<div className="mb-2 text-center text-[10px] font-medium">{t('choose-own-amount')}</div>
			<div className="border-muted divide-muted mb-4 grid grid-cols-4 divide-x overflow-hidden rounded-xl border">
				{amountOptions.map((option) => {
					const isSelected = option.value === selectedAmount;
					const label = t(option.labelKey);
					return (
						<button
							key={option.value ?? 'other'}
							type="button"
							onClick={() => setSelectedAmount(option.value)}
							className={cn(
								'flex flex-col items-center justify-center p-3 leading-none font-medium transition-colors',
								isSelected && 'bg-muted',
							)}
						>
							<span className={cn(option.labelKey === 'other' ? 'text-base' : 'text-[10px]')}>{label}</span>
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
						cadence === 'monthly' && 'bg-white shadow-xs',
					)}
				>
					{t('monthly')}
				</button>
				<button
					type="button"
					onClick={() => setCadence('one-time')}
					className={cn(
						'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
						cadence === 'one-time' && 'bg-white shadow-xs',
					)}
				>
					{t('one-time')}
				</button>
			</div>

			<Button className="h-10 w-full text-sm font-semibold">{t('donate-now')}</Button>
		</div>
	);
};
