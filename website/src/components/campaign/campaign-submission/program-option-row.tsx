'use client';

import { Button } from '@/components/button';
import { CountryFlag } from '@/components/country-flag';
import { RadioGroupItem } from '@/components/radio-group';
import type { CountryCode } from '@/generated/prisma/client';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

type Props = {
	value: string;
	name: string;
	selected: boolean;
	recipientsLabel: string;
	detailsLabel: string;
	countryIsoCodes: readonly CountryCode[];
};

export const ProgramOptionRow = ({ value, name, selected, recipientsLabel, detailsLabel, countryIsoCodes }: Props) => {
	return (
		<label
			data-testid={`program-option-${value}`}
			className={cn(
				'border-border hover:bg-muted/30 flex cursor-pointer items-center gap-3 border-b px-1 py-4 transition-colors last:border-b-0',
				selected && 'bg-muted/20',
			)}
		>
			<RadioGroupItem value={value} className="shrink-0" />
			<span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
			<span className="text-muted-foreground shrink-0 text-sm">{recipientsLabel}</span>
			<span className="flex shrink-0 items-center -space-x-1">
				{countryIsoCodes.map((countryIsoCode) => (
					<span key={countryIsoCode} className="ring-background inline-flex rounded-full ring-2">
						<CountryFlag country={countryIsoCode} size="sm" />
					</span>
				))}
			</span>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="shrink-0"
				onClick={(event) => {
					// Placeholder until program details are implemented.
					event.preventDefault();
					event.stopPropagation();
				}}
			>
				{detailsLabel}
				<ChevronDown className="size-4" aria-hidden="true" />
			</Button>
		</label>
	);
};
