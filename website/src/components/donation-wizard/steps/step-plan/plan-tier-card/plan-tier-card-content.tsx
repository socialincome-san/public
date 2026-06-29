'use client';

import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils/cn';
import { Check, Heart, Smile } from 'lucide-react';
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
		<div className="text-foreground mb-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
			<span className="text-lg leading-none font-medium">
				{currency} {amount}
			</span>
			{perMonthLabel && <span className="text-muted-foreground text-sm">{perMonthLabel}</span>}
			{planLabel && (
				<Badge
					variant={badgeVariant === 'preferred' ? 'verified' : 'default'}
					className="gap-0.5 px-2 py-0.5 text-[10px] sm:ml-auto"
				>
					{planLabel}
					{badgeVariant === 'preferred' && <Smile className="size-2.5" aria-hidden />}
					{badgeVariant === 'plan' &&
						Array.from({ length: heartCount }).map((_, index) => (
							<Heart key={index} className="size-2 fill-current" aria-hidden />
						))}
				</Badge>
			)}
		</div>
		<ul className="text-foreground flex flex-col gap-2">
			{benefits.map((benefit) => (
				<li key={benefit.id} className="flex gap-1.5 text-sm">
					{benefit.icon === 'heart' ? (
						<Heart className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
					) : (
						<Check className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
					)}
					<span className={cn('min-w-0 break-words', benefit.emphasis && 'font-bold')}>{benefit.label}</span>
				</li>
			))}
		</ul>
	</>
);
