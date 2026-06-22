'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { cn } from '@socialincome/ui';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
	applyQueryParamOverrides,
	COUNTRY_QUERY_KEY,
	FOCUS_QUERY_KEY,
	type QueryParamOverride,
} from './programs-overview-query';

type FilterOption = {
	value: string;
	label: string;
};

type ProgramsOverviewFiltersProps = {
	allCountriesLabel: string;
	allFocusesLabel: string;
	countryOptions: FilterOption[];
	selectedCountryIsoCode?: string;
	focusOptions: FilterOption[];
	selectedFocusId?: string;
	showFocusFilter?: boolean;
	queryParamOverrides?: QueryParamOverride[];
};

type FilterDropdownProps = {
	allLabel: string;
	options: FilterOption[];
	queryKey: string;
	selectedValue?: string;
	queryParamOverrides?: QueryParamOverride[];
};

const updateFilterQuery = ({
	pathname,
	router,
	searchParams,
	queryKey,
	value,
	queryParamOverrides,
}: {
	pathname: string;
	router: ReturnType<typeof useRouter>;
	searchParams: ReturnType<typeof useSearchParams>;
	queryKey: string;
	value: string | undefined;
	queryParamOverrides?: QueryParamOverride[];
}) => {
	const nextParams = new URLSearchParams(searchParams.toString());

	if (value) {
		nextParams.set(queryKey, value);
	} else {
		nextParams.delete(queryKey);
	}

	applyQueryParamOverrides(nextParams, queryParamOverrides);

	const nextQuery = nextParams.toString();
	router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
};

const FilterDropdown = ({ allLabel, options, queryKey, selectedValue, queryParamOverrides }: FilterDropdownProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedOption = options.find((option) => option.value === selectedValue);
	const isActive = Boolean(selectedOption);
	const buttonLabel = selectedOption?.label ?? allLabel;

	const updateFilter = (value: string | undefined) => {
		updateFilterQuery({ pathname, router, searchParams, queryKey, value, queryParamOverrides });
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
	allCountriesLabel,
	allFocusesLabel,
	countryOptions,
	selectedCountryIsoCode,
	focusOptions,
	selectedFocusId,
	showFocusFilter = true,
	queryParamOverrides,
}: ProgramsOverviewFiltersProps) => {
	return (
		<div className="flex min-h-10 flex-1 flex-wrap items-center gap-2">
			<FilterDropdown
				allLabel={allCountriesLabel}
				options={countryOptions}
				queryKey={COUNTRY_QUERY_KEY}
				selectedValue={selectedCountryIsoCode}
				queryParamOverrides={queryParamOverrides}
			/>
			{showFocusFilter && (
				<FilterDropdown
					allLabel={allFocusesLabel}
					options={focusOptions}
					queryKey={FOCUS_QUERY_KEY}
					selectedValue={selectedFocusId}
					queryParamOverrides={queryParamOverrides}
				/>
			)}
		</div>
	);
};
