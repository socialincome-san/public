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
	focusOptions: CountryFilterOption[];
	selectedFocus?: string;
};

const COUNTRY_QUERY_KEY = 'country';
const FOCUS_QUERY_KEY = 'focus';

const getAllCountriesLabel = (countryCount: number) => `All countries (${countryCount})`;
const getAllFocusesLabel = (focusCount: number) => `All focuses (${focusCount})`;

const updateFilterQuery = ({
	pathname,
	router,
	searchParams,
	queryKey,
	value,
}: {
	pathname: string;
	router: ReturnType<typeof useRouter>;
	searchParams: ReturnType<typeof useSearchParams>;
	queryKey: string;
	value: string | undefined;
}) => {
	const nextParams = new URLSearchParams(searchParams.toString());

	if (value) {
		nextParams.set(queryKey, value);
	} else {
		nextParams.delete(queryKey);
	}

	const nextQuery = nextParams.toString();
	router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
};

const CountryFilter = ({
	countryOptions,
	selectedCountry,
}: Pick<ProgramsOverviewFiltersProps, 'countryOptions' | 'selectedCountry'>) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedCountryOption = countryOptions.find((option) => option.value === selectedCountry);
	const isActive = Boolean(selectedCountryOption);
	const buttonLabel = selectedCountryOption?.label ?? getAllCountriesLabel(countryOptions.length);

	const updateCountryFilter = (country: string | undefined) => {
		updateFilterQuery({ pathname, router, searchParams, queryKey: COUNTRY_QUERY_KEY, value: country });
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

const FocusFilter = ({
	focusOptions,
	selectedFocus,
}: Pick<ProgramsOverviewFiltersProps, 'focusOptions' | 'selectedFocus'>) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedFocusOption = focusOptions.find((option) => option.value === selectedFocus);
	const isActive = Boolean(selectedFocusOption);
	const buttonLabel = selectedFocusOption?.label ?? getAllFocusesLabel(focusOptions.length);

	const updateFocusFilter = (focus: string | undefined) => {
		updateFilterQuery({ pathname, router, searchParams, queryKey: FOCUS_QUERY_KEY, value: focus });
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
				<DropdownMenuItem onSelect={() => updateFocusFilter(undefined)}>
					{getAllFocusesLabel(focusOptions.length)}
				</DropdownMenuItem>
				{focusOptions.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateFocusFilter(option.value)}>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const ProgramsOverviewFilters = ({
	countryOptions,
	selectedCountry,
	focusOptions,
	selectedFocus,
}: ProgramsOverviewFiltersProps) => {
	return (
		<div className="flex min-h-10 flex-1 flex-wrap items-center gap-2">
			<CountryFilter countryOptions={countryOptions} selectedCountry={selectedCountry} />
			<FocusFilter focusOptions={focusOptions} selectedFocus={selectedFocus} />
		</div>
	);
};
