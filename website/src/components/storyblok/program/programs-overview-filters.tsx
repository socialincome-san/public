'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@socialincome/ui';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type FilterOption = {
	value: string;
	label: string;
};

type ProgramsOverviewFiltersProps = {
	countryOptions: FilterOption[];
	selectedCountry?: string;
	focusOptions: FilterOption[];
	selectedFocus?: string;
};

type FilterDropdownProps = {
	allLabel: string;
	options: FilterOption[];
	queryKey: string;
	selectedValue?: string;
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

const FilterDropdown = ({ allLabel, options, queryKey, selectedValue }: FilterDropdownProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = options.find((option) => option.value === selectedValue);
	const isActive = Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allLabel;

	const updateFilter = (value: string | undefined) => {
		updateFilterQuery({ pathname, router, searchParams, queryKey, value });
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
				<DropdownMenuItem onSelect={() => updateFilter(undefined)}>{allLabel}</DropdownMenuItem>
				{options.map((option) => (
					<DropdownMenuItem key={option.value} onSelect={() => updateFilter(option.value)}>
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
			<FilterDropdown
				allLabel={getAllCountriesLabel(countryOptions.length)}
				options={countryOptions}
				queryKey={COUNTRY_QUERY_KEY}
				selectedValue={selectedCountry}
			/>
			<FilterDropdown
				allLabel={getAllFocusesLabel(focusOptions.length)}
				options={focusOptions}
				queryKey={FOCUS_QUERY_KEY}
				selectedValue={selectedFocus}
			/>
		</div>
	);
};
