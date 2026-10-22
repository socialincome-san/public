'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import { Combobox } from '../../forms/combo-box/combo-box';
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

type SearchableOptionGroup<TOption> = OptionGroup<TOption> & {
	searchPlaceholder: string;
	emptyLabel: string;
};

type LocaleCurrencySwitcherProps = {
	ariaLabel: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	language: OptionGroup<LocaleCurrencyOption>;
	currency: OptionGroup<LocaleCurrencyOption>;
	country?: SearchableOptionGroup<LocaleCurrencyOption>;
	variant?: 'ghost' | 'outline';
	icon?: ReactNode;
};

export const LocaleCurrencySwitcherGlobe = () => <Globe className="size-4" />;

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

const OptionCombobox = ({
	label,
	value,
	options,
	onChange,
	searchPlaceholder,
	emptyLabel,
}: SearchableOptionGroup<LocaleCurrencyOption>) => (
	<div className="space-y-2">
		<div className="text-sm font-bold">{label}</div>
		<Combobox
			ariaLabel={label}
			value={value}
			options={options.map((option) => ({ id: option.value, label: option.label }))}
			onChange={onChange}
			searchPlaceholder={searchPlaceholder}
			emptyLabel={emptyLabel}
		/>
	</div>
);

export const LocaleCurrencySwitcher = ({
	ariaLabel,
	open,
	onOpenChange,
	language,
	currency,
	country,
	variant = 'ghost',
	icon = <LocaleCurrencySwitcherGlobe />,
}: LocaleCurrencySwitcherProps) => (
	<Popover open={open} onOpenChange={onOpenChange}>
		<PopoverTrigger asChild>
			<Button type="button" variant={variant} size="md" aria-label={ariaLabel}>
				{icon}
				<span>
					{language.value.toUpperCase()} · {currency.value}
				</span>
				<ChevronDown className="text-muted-foreground size-3.5" />
			</Button>
		</PopoverTrigger>
		<PopoverContent align="end">
			<div className="space-y-4">
				<OptionTabs {...language} />
				<OptionTabs {...currency} />
				{country && <OptionCombobox {...country} />}
			</div>
		</PopoverContent>
	</Popover>
);
