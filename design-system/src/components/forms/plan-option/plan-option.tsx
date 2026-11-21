'use client';

import { Check, Heart } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../../cn';

type PlanOptionItem = {
	id: string;
	label: string;
	icon?: 'check' | 'heart';
	emphasis?: boolean;
	// Keeps the row's height while its text loads, so the card does not grow afterwards
	placeholder?: boolean;
};

type PlanOptionProps = {
	amount: string;
	suffix?: string;
	badge?: ReactNode;
	items: PlanOptionItem[];
	selected: boolean;
	onSelect: () => void;
	testId?: string;
};

export const PlanOption = ({ amount, suffix, badge, items, selected, onSelect, testId }: PlanOptionProps) => (
	<button
		type="button"
		data-testid={testId}
		aria-pressed={selected}
		onClick={onSelect}
		className={cn(
			'text-foreground focus-visible:ring-ring w-full min-w-0 rounded-xl border px-4 pt-3.5 pb-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
			selected ? 'border-primary bg-primary/5 ring-primary ring-1 ring-inset' : 'border-input/60 bg-card hover:bg-muted/50',
		)}
	>
		<span className="mb-3 flex items-start gap-2.5">
			<span className="flex min-h-7 min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1.5">
				<span className="flex items-baseline gap-1 whitespace-nowrap">
					<span className="text-xl leading-none font-semibold tracking-tight">{amount}</span>
					{suffix ? <span className="text-muted-foreground text-sm leading-none">{suffix}</span> : null}
				</span>
				{badge}
			</span>
			<span className="flex h-7 items-center">
				<span
					aria-hidden
					className={cn(
						'size-5.5 rounded-full',
						selected ? 'border-primary bg-background border-[7px]' : 'border-muted-foreground/60 border-[1.5px]',
					)}
				/>
			</span>
		</span>
		<ul className="flex flex-col gap-1.5">
			{items.map((item) => (
				<li
					key={item.id}
					aria-hidden={item.placeholder}
					className={cn('flex gap-2 text-sm leading-5', item.emphasis && 'font-semibold', item.placeholder && 'invisible')}
				>
					<span className="text-muted-foreground flex h-5 shrink-0 items-center">
						{item.icon === 'heart' ? <Heart className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
					</span>
					<span className="min-w-0 break-words whitespace-pre-line">{item.label}</span>
				</li>
			))}
		</ul>
	</button>
);
