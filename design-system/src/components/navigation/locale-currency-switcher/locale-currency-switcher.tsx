'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlays/popover/popover';
import { Tabs, TabsList, TabsTrigger } from '../tabs/tabs';

export type LocaleCurrencyOption = {
	value: string;
	label: string;
};

type OptionGroup<TOption> = {
	label: string;
	value: string;
	options: TOption[];
	onChange: (value: string) => void;
};

type LocaleCurrencySwitcherProps = {
	ariaLabel: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	language: OptionGroup<LocaleCurrencyOption>;
	currency: OptionGroup<LocaleCurrencyOption>;
	variant?: 'ghost' | 'outline';
};

const OptionTabs = ({ label, value, options, onChange }: OptionGroup<LocaleCurrencyOption>) => (
	<div className="space-y-2">
		<div className="text-sm font-bold">{label}</div>
		<Tabs value={value} onValueChange={onChange}>
			<TabsList fullWidth>
				{options.map((option) => (
					<TabsTrigger key={option.value} value={option.value}>
						{option.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	</div>
);

export const LocaleCurrencySwitcher = ({
	ariaLabel,
	open,
	onOpenChange,
	language,
	currency,
	variant = 'ghost',
}: LocaleCurrencySwitcherProps) => (
	<Popover open={open} onOpenChange={onOpenChange}>
		<PopoverTrigger asChild>
			<Button type="button" variant={variant} size="md" aria-label={ariaLabel}>
				<Globe className="size-4" />
				<span>{currency.value}</span>
				<ChevronDown className="text-muted-foreground size-3.5" />
			</Button>
		</PopoverTrigger>
		<PopoverContent align="end">
			<div className="space-y-4">
				<OptionTabs {...language} />
				<OptionTabs {...currency} />
			</div>
		</PopoverContent>
	</Popover>
);
