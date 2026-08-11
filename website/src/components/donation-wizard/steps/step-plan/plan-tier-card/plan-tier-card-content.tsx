'use client';

import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils/cn';
import { Check, Heart } from 'lucide-react';
import type { PlanTierBenefit } from './plan-tier-benefit';

type Props = {
	amount: number;
	currency: string;
	perMonthLabel?: string;
	planLabel?: string;
	badgeVariant: 'plan' | 'preferred';
	heartCount: 1 | 2;
	benefits: PlanTierBenefit[];
};

export const PlanTierCardContent = ({
	amount,
	currency,
	perMonthLabel,
	planLabel,
	badgeVariant,
	heartCount,
	benefits,
}: Props) => (
	<>
		<div className="text-foreground mb-2.5 flex items-center gap-x-1.5">
			<div className="flex min-w-0 items-center gap-x-1.5">
				<span className="text-lg leading-none font-medium whitespace-nowrap">
					{currency} {amount}
				</span>
				{perMonthLabel ? (
					<span className="text-muted-foreground text-sm leading-none whitespace-nowrap">{perMonthLabel}</span>
				) : null}
			</div>
			{planLabel ? (
				<Badge
					variant={badgeVariant === 'preferred' ? 'verified' : 'default'}
					className="ml-auto shrink-0 gap-0.5 px-2 py-0.5 text-[10px]"
				>
					{planLabel}
					{badgeVariant === 'plan' &&
						Array.from({ length: heartCount }).map((_, index) => (
							<Heart key={index} className="size-2 fill-current" aria-hidden />
						))}
				</Badge>
			) : null}
		</div>
		<ul className="text-foreground flex flex-col gap-2">
			{benefits.map((benefit) => (
				<li key={benefit.id} className="flex gap-1.5 text-sm">
					{benefit.icon === 'heart' ? (
						<Heart className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
					) : (
						<Check className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
					)}
					<span className={cn('min-w-0 break-words whitespace-pre-line', benefit.emphasis && 'font-bold')}>
						{benefit.label}
					</span>
				</li>
			))}
		</ul>
	</>
);
