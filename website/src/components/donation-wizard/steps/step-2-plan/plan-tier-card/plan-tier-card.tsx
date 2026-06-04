'use client';

import { SelectableCard } from '@/components/selectable-card';
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
}: Props) => (
	<SelectableCard selected={selected} onSelect={onSelect} className="w-full p-4">
		<PlanTierCardContent
			amount={amount}
			currency={currency}
			perMonthLabel={perMonthLabel}
			planLabel={planLabel}
			badgeVariant={badgeVariant}
			heartCount={heartCount}
			benefits={benefits}
		/>
	</SelectableCard>
);
