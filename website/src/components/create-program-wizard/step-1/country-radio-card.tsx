'use client';

import { cn } from '@socialincome/design-system/cn';
import { RadioGroupItem } from '@socialincome/design-system/forms/radio-group/radio-group';
import type { ReactNode } from 'react';

type Props = {
	value: string;
	checked?: boolean;
	label: ReactNode;
	programCount: number;
	programLabel: string;
	recipientCount: number;
	recipientLabel: string;
};

type CountryRadioCardStatProps = {
	value: number;
	label: string;
};

const CountryRadioCardStat = ({ value, label }: CountryRadioCardStatProps) => (
	<div className="flex flex-col gap-0">
		<div className="text-muted-foreground text-2xl font-semibold">{value}</div>
		<div className="text-muted-foreground text-sm font-medium">{label}</div>
	</div>
);

export const CountryRadioCard = ({
	value,
	checked,
	label,
	programCount,
	programLabel,
	recipientCount,
	recipientLabel,
}: Props) => (
	<label
		data-testid={`radio-card-${value}`}
		className={cn(
			'border-border bg-card relative flex h-full flex-1 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
			checked && 'border-muted-foreground bg-muted',
		)}
	>
		<span className="absolute top-3 right-3 flex">
			<RadioGroupItem value={value} />
		</span>

		<div className="flex-1 space-y-3 pr-6">
			<div className="flex items-center gap-2">{label}</div>
			<div className="grid grid-cols-2 gap-3">
				<CountryRadioCardStat value={programCount} label={programLabel} />
				<CountryRadioCardStat value={recipientCount} label={recipientLabel} />
			</div>
		</div>
	</label>
);
