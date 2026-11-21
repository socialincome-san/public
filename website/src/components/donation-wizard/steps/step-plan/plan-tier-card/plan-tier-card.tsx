'use client';

import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { PlanOption } from '@socialincome/design-system/forms/plan-option/plan-option';
import { Heart } from 'lucide-react';
import type { PlanTierBenefit } from './plan-tier-benefit';

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
	<PlanOption
		amount={`${currency} ${amount}`}
		suffix={perMonthLabel}
		badge={
			planLabel ? (
				<Badge variant={badgeVariant === 'preferred' ? 'verified' : 'default'} size="sm">
					{planLabel}
					{badgeVariant === 'plan' &&
						Array.from({ length: heartCount }).map((_, index) => (
							<Heart key={index} className="size-2 fill-current" aria-hidden />
						))}
				</Badge>
			) : undefined
		}
		items={benefits}
		selected={selected}
		onSelect={onSelect}
		testId={heartCount === 2 ? 'donation-wizard-plan-tier-2x' : 'donation-wizard-plan-tier-1x'}
	/>
);
