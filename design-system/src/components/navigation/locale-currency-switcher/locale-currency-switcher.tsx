'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '../../actions/button/button';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlays/popover/popover';
import { Tabs, TabsList, TabsTrigger } from '../tabs/tabs';

export type LocaleCurrencyOption = {
	value: string;
	label: string;
};

export type LocaleRegionOption = LocaleCurrencyOption & {
	flagCountry?: string;
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
	region: OptionGroup<LocaleRegionOption>;
	currency: OptionGroup<LocaleCurrencyOption>;
	variant?: 'ghost' | 'outline';
};

const RegionIcon = ({ flagCountry }: { flagCountry?: string }) =>
	flagCountry ? <CountryFlag country={flagCountry} size="sm" /> : <Globe className="size-4" />;

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
	region,
	currency,
	variant = 'ghost',
}: LocaleCurrencySwitcherProps) => {
	const selectedRegion = region.options.find((option) => option.value === region.value);

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button type="button" variant={variant} size="md" aria-label={ariaLabel}>
					<RegionIcon flagCountry={selectedRegion?.flagCountry} />
					<span>{currency.value}</span>
					<ChevronDown className="text-muted-foreground size-3.5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end">
				<div className="space-y-4">
					<OptionTabs {...language} />

					<div className="space-y-2">
						<div className="text-sm font-bold">{region.label}</div>
						<Tabs value={region.value} onValueChange={region.onChange}>
							<TabsList fullWidth>
								{region.options.map((option) => (
									<TabsTrigger key={option.value} value={option.value}>
										<RegionIcon flagCountry={option.flagCountry} />
										<span>{option.label}</span>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>

					<OptionTabs {...currency} />
				</div>
			</PopoverContent>
		</Popover>
	);
};
