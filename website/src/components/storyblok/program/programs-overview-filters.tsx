'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@socialincome/ui';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type CountryFilterOption = {
	value: string;
	label: string;
};

type ProgramsOverviewFiltersProps = {
	countryOptions: CountryFilterOption[];
	selectedCountry?: string;
};

const COUNTRY_QUERY_KEY = 'country';

const getAllCountriesLabel = (countryCount: number) => `All countries (${countryCount})`;

const CountryFilter = ({ countryOptions, selectedCountry }: ProgramsOverviewFiltersProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedCountryOption = countryOptions.find((option) => option.value === selectedCountry);
	const isActive = Boolean(selectedCountryOption);
	const buttonLabel = selectedCountryOption?.label ?? getAllCountriesLabel(countryOptions.length);

	const updateCountryFilter = (country: string | undefined) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		if (country) {
			nextParams.set(COUNTRY_QUERY_KEY, country);
		} else {
			nextParams.delete(COUNTRY_QUERY_KEY);
		}

		const nextQuery = nextParams.toString();
		router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(
						'text-foreground h-10 border-slate-200 bg-white px-4 text-sm font-medium hover:bg-white',
						isActive && 'bg-input hover:bg-input',
					)}
				>
					{buttonLabel}
					<ChevronDown className="text-foreground size-4 opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56 bg-white">
				<DropdownMenuItem onSelect={() => updateCountryFilter(undefined)}>
					{getAllCountriesLabel(countryOptions.length)}
				</DropdownMenuItem>
				{countryOptions.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateCountryFilter(option.value)}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const ProgramsOverviewFilters = ({ countryOptions, selectedCountry }: ProgramsOverviewFiltersProps) => {
	return (
		<div className="flex min-h-10 flex-1 flex-wrap items-center gap-2">
			<CountryFilter countryOptions={countryOptions} selectedCountry={selectedCountry} />
		</div>
	);
};
