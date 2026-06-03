'use client';

import { cn } from '@/lib/utils/cn';
import { Check, Heart, Smile } from 'lucide-react';

type Benefit = {
	id: string;
	label: string;
	icon?: 'check' | 'heart';
	emphasis?: boolean;
};

type Props = {
	amount: number;
	currency: string;
	perMonthLabel?: string;
	planLabel?: string;
	badgeVariant?: 'plan' | 'preferred';
	heartCount?: 1 | 2;
	selected: boolean;
	benefits: Benefit[];
	onSelect?: () => void;
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

	if (!onSelect) {
		return (
			<div className={className}>
				<PlanTierCardContent
					amount={amount}
					currency={currency}
					perMonthLabel={perMonthLabel}
					planLabel={planLabel}
					badgeVariant={badgeVariant}
					heartCount={heartCount}
					benefits={benefits}
				/>
			</div>
		);
	}

	return (
		<button type="button" onClick={onSelect} className={className}>
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

const PlanTierCardContent = ({
	amount,
	currency,
	perMonthLabel,
	planLabel,
	badgeVariant,
	heartCount,
	benefits,
}: Pick<Props, 'amount' | 'currency' | 'perMonthLabel' | 'planLabel' | 'badgeVariant' | 'heartCount' | 'benefits'> & {
	heartCount: 1 | 2;
}) => (
	<>
		<div className="mb-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
			<span className="text-lg leading-none font-medium tabular-nums">
				{currency} {amount}
			</span>
			{perMonthLabel && <span className="text-muted-foreground text-sm">{perMonthLabel}</span>}
			{planLabel && (
				<span
					className={cn(
						'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:ml-auto',
						badgeVariant === 'preferred' ? 'text-foreground border-green-300 bg-green-100' : 'bg-muted border-border',
					)}
				>
					{planLabel}
					{badgeVariant === 'preferred' && <Smile className="size-2.5" aria-hidden />}
					{badgeVariant === 'plan' &&
						Array.from({ length: heartCount }).map((_, index) => (
							<Heart key={index} className="size-2 fill-current" aria-hidden />
						))}
				</span>
			)}
		</div>
		<ul className="flex flex-col gap-2">
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
