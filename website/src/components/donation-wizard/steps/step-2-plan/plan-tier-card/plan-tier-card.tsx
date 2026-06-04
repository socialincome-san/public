'use client';

import { cn } from '@/lib/utils/cn';
import type { PlanTierBenefit } from './plan-tier-benefit';
import { PlanTierCardContent } from './plan-tier-card-content';

type Props = {
	amount: number;
	currency: string;
	perMonthLabel?: string;
	planLabel?: string;
	badgeVariant?: 'plan' | 'preferred';
	heartCount?: 1 | 2;
	selected: boolean;
	benefits: PlanTierBenefit[];
	onSelect: () => void;
};

export const PlanTierCard = ({
	amount,
	currency,
	perMonthLabel,
	planLabel,
	badgeVariant = 'plan',
	heartCount = 1,
	selected,
	benefits,
	onSelect,
}: Props) => {
	const className = cn(
		'w-full rounded-[10px] border p-4 text-left transition-colors',
		selected ? 'border-slate-500 bg-slate-50' : 'border-border bg-white',
	);

	return (
		<button type="button" aria-pressed={selected} onClick={onSelect} className={className}>
			<PlanTierCardContent
				amount={amount}
				currency={currency}
				perMonthLabel={perMonthLabel}
				planLabel={planLabel}
				badgeVariant={badgeVariant}
				heartCount={heartCount}
				benefits={benefits}
			/>
		</button>
	);
};
