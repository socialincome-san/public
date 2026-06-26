'use client';

import { RadioGroupItem } from '@/components/radio-group';
import { cn } from '@/lib/utils/cn';
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
		<div className="text-2xl font-semibold text-slate-600">{value}</div>
		<div className="text-sm font-medium text-slate-600">{label}</div>
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
			'border-border relative flex h-full flex-1 cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors',
			checked && 'border-slate-500 bg-slate-100',
		)}
	>
		<RadioGroupItem value={value} className="absolute top-3 right-3" />

		<div className="flex-1 space-y-3 pr-6">
			<div className="flex items-center gap-2">{label}</div>
			<div className="grid grid-cols-2 gap-3">
				<CountryRadioCardStat value={programCount} label={programLabel} />
				<CountryRadioCardStat value={recipientCount} label={recipientLabel} />
			</div>
		</div>
	</label>
);
